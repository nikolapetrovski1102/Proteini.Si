using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.DTOs;
using System.Security.Claims;

namespace ProteiniSi.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public CartController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
        }

        private int? GetUserId()
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return null;

            return int.Parse(userIdClaim);
        }

        // GET: api/cart
        [HttpGet]
        public IActionResult GetCart()
        {
            try
            {
                int? userId = GetUserId();

                if (!userId.HasValue)
                {
                    return Ok(new CartResponseDto
                    {
                        Cart_Id = 0,
                        Items = new List<CartItemResponseDto>(),
                        Total = 0,
                        TotalItems = 0
                    });
                }

                string getCartSql = "SELECT Cart_Id FROM ShoppingCart WHERE User_Id = @UserId";
                var cartId = _dapper.LoadDataSingleOrDefault<int?>(getCartSql, new { UserId = userId.Value });

                if (!cartId.HasValue)
                {
                    return Ok(new CartResponseDto
                    {
                        Cart_Id = 0,
                        Items = new List<CartItemResponseDto>(),
                        Total = 0,
                        TotalItems = 0
                    });
                }

                // Recalculate the current catalog price so an expired sale cannot remain
                // visible (or payable) just because the item was added to the cart earlier.
                string sql = @"
            SELECT 
                ci.CartItem_Id,
                ci.Product_Id,
                ci.Variant_Id,
                ci.Variant_Name,
                ci.Variant_Packaging,
                ci.Quantity,
                currentPrice.EffectivePrice as Price,
                ci.Display_Name,
                p.Name as Product_Name,
                p.Img as Product_Img,
                pv.Price as Variant_Original_Price,
                CASE
                    WHEN p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND pv.Compare_Price IS NOT NULL
                     AND pv.Compare_Price > 0
                     AND pv.Compare_Price < pv.Price
                        THEN pv.Compare_Price
                    ELSE NULL
                END as Variant_Compare_Price,
                pkg.Weight_Grams as Variant_Weight_Grams,
                (ci.Quantity * currentPrice.EffectivePrice) as Subtotal
            FROM CartItems ci
            INNER JOIN Products p ON ci.Product_Id = p.Product_Id
            LEFT JOIN ProductVariants pv ON ci.Variant_Id = pv.Variant_Id AND pv.IsActive = 1
            LEFT JOIN Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
            CROSS APPLY (
                SELECT CAST(
                    CASE
                        WHEN p.IsGiftVoucher = 1 THEN ci.Price
                        WHEN ci.Variant_Id IS NULL
                         AND p.ProductsOnSale = 1
                         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                         AND p.SalePrice IS NOT NULL
                         AND p.SalePrice > 0
                         AND p.SalePrice < p.Price
                            THEN p.SalePrice
                        WHEN ci.Variant_Id IS NULL THEN p.Price
                        WHEN p.ProductsOnSale = 1
                         AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                         AND pv.Compare_Price IS NOT NULL
                         AND pv.Compare_Price > 0
                         AND pv.Compare_Price < pv.Price
                            THEN pv.Compare_Price
                        ELSE COALESCE(pv.Price, ci.Price)
                    END AS decimal(18, 2)
                ) AS EffectivePrice
            ) currentPrice
            WHERE ci.Cart_Id = @CartId";

                var items = _dapper.LoadData<CartItemResponseDto>(sql, new { CartId = cartId.Value }).ToList();

                var total = items.Sum(i => i.Subtotal);
                var totalItems = items.Sum(i => i.Quantity);

                return Ok(new CartResponseDto
                {
                    Cart_Id = cartId.Value,
                    Items = items,
                    Total = total,
                    TotalItems = totalItems
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetCart: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/cart/add
        [HttpPost("add")]
        public IActionResult AddToCart([FromBody] AddToCartDto dto)
        {
            try
            {
                if (dto.Quantity <= 0)
                    return BadRequest(new { error = "Quantity must be greater than zero" });

                int? userId = GetUserId();

                if (!userId.HasValue)
                {
                    return Ok(new { success = true, message = "Product added to cart (guest mode)", isGuest = true });
                }

                string getCartSql = "SELECT Cart_Id FROM ShoppingCart WHERE User_Id = @UserId";
                var cartId = _dapper.LoadDataSingleOrDefault<int?>(getCartSql, new { UserId = userId.Value });

                if (!cartId.HasValue)
                {
                    string createCartSql = @"
                INSERT INTO ShoppingCart (User_Id, CreatedAt, UpdatedAt) 
                VALUES (@UserId, GETDATE(), GETDATE());
                SELECT CAST(SCOPE_IDENTITY() AS int);";
                    cartId = _dapper.LoadDataSingle<int>(createCartSql, new { UserId = userId.Value });
                }

                string productSql = @"
            SELECT 
                p.Product_Id, 
                p.Name, 
                p.Img, 
                p.HasVariants,
                p.IsGiftVoucher,
                p.VoucherMinAmount,
                p.VoucherMaxAmount,
                pv.Variant_Id as CatalogVariantId,
                COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, '')) as CatalogVariantName,
                pv.Packaging_Name as CatalogVariantPackaging,
                CASE
                    WHEN pv.Variant_Id IS NULL
                     AND p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND p.SalePrice > 0
                     AND p.SalePrice < p.Price
                        THEN p.SalePrice
                    WHEN pv.Variant_Id IS NULL THEN CAST(p.Price AS decimal(18, 2))
                    WHEN p.ProductsOnSale = 1
                     AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                     AND pv.Compare_Price IS NOT NULL AND pv.Compare_Price > 0 AND pv.Compare_Price < pv.Price
                        THEN pv.Compare_Price
                    ELSE pv.Price
                END as EffectivePrice,
                CASE WHEN pv.Variant_Id IS NOT NULL THEN pv.Quantity ELSE p.Quantity END as AvailableQuantity
            FROM Products p
            LEFT JOIN ProductVariants pv
                ON pv.Variant_Id = @VariantId
                AND pv.Product_Id = p.Product_Id
                AND pv.IsActive = 1
            WHERE p.Product_Id = @ProductId";
                var productInfo = _dapper.LoadDataSingleOrDefault<dynamic>(productSql, new
                {
                    ProductId = dto.Product_Id,
                    VariantId = dto.Variant_Id
                });

                if (productInfo == null)
                    return NotFound(new { error = "Product not found" });

                if (!dto.Variant_Id.HasValue && Convert.ToBoolean(productInfo.HasVariants))
                    return BadRequest(new { error = "A package or variant must be selected for this product" });

                if (dto.Variant_Id.HasValue && productInfo.CatalogVariantId == null)
                    return BadRequest(new { error = "The selected variant is invalid, unavailable, or does not belong to this product" });

                decimal finalPrice = (decimal)productInfo.EffectivePrice;
                bool isGiftVoucher = Convert.ToBoolean(productInfo.IsGiftVoucher);
                if (isGiftVoucher)
                {
                    decimal minimum = productInfo.VoucherMinAmount != null
                        ? (decimal)productInfo.VoucherMinAmount
                        : 500m;
                    decimal? maximum = productInfo.VoucherMaxAmount != null
                        ? (decimal?)productInfo.VoucherMaxAmount
                        : null;
                    decimal requestedAmount = dto.Price ?? finalPrice;

                    if (requestedAmount < minimum || (maximum.HasValue && requestedAmount > maximum.Value))
                    {
                        return BadRequest(new
                        {
                            error = maximum.HasValue
                                ? $"Voucher amount must be between {minimum:F0} and {maximum.Value:F0} MKD"
                                : $"Voucher amount must be at least {minimum:F0} MKD"
                        });
                    }

                    finalPrice = decimal.Round(requestedAmount, 2);
                }
                int availableQuantity = (int)productInfo.AvailableQuantity;
                string? variantName = dto.Variant_Id.HasValue ? (string?)productInfo.CatalogVariantName : null;
                string? variantPackaging = dto.Variant_Id.HasValue ? (string?)productInfo.CatalogVariantPackaging : null;

                string displayName = productInfo.Name;
                if (isGiftVoucher)
                {
                    displayName += $" - MKD {finalPrice:F2}";
                }
                if (!string.IsNullOrEmpty(variantName))
                {
                    displayName += $" - {variantName}";
                }
                if (!string.IsNullOrEmpty(variantPackaging))
                {
                    displayName += $" ({variantPackaging})";
                }

                string checkSql = @"
            SELECT CartItem_Id, Quantity FROM CartItems 
            WHERE Cart_Id = @CartId 
            AND Product_Id = @ProductId 
            AND ((@Variant_Id IS NULL AND Variant_Id IS NULL) OR (Variant_Id = @Variant_Id))
            AND (@IsGiftVoucher = 0 OR Price = @Price)";

                var existingItem = _dapper.LoadDataSingleOrDefault<dynamic>(checkSql, new
                {
                    CartId = cartId.Value,
                    ProductId = dto.Product_Id,
                    Variant_Id = dto.Variant_Id,
                    IsGiftVoucher = isGiftVoucher,
                    Price = finalPrice
                });

                if (existingItem != null)
                {
                    int newQuantity = existingItem.Quantity + dto.Quantity;
                    if (newQuantity > availableQuantity)
                        return BadRequest(new { error = $"Insufficient stock. Available: {availableQuantity}, Requested: {newQuantity}" });

                    string updateSql = @"
                UPDATE CartItems 
                SET Quantity = @Quantity,
                    Price = @Price,
                    Variant_Name = @VariantName,
                    Variant_Packaging = @VariantPackaging,
                    Display_Name = @DisplayName,
                    UpdatedAt = GETDATE()
                WHERE CartItem_Id = @CartItemId";

                    _dapper.ExecuteSql(updateSql, new
                    {
                        Quantity = newQuantity,
                        Price = finalPrice,
                        VariantName = variantName,
                        VariantPackaging = variantPackaging,
                        DisplayName = displayName,
                        CartItemId = existingItem.CartItem_Id
                    });
                }
                else
                {
                    if (dto.Quantity > availableQuantity)
                        return BadRequest(new { error = $"Insufficient stock. Available: {availableQuantity}, Requested: {dto.Quantity}" });

                    string insertSql = @"
                INSERT INTO CartItems (
                    Cart_Id, Product_Id, Variant_Id, Variant_Name, Variant_Packaging,
                    Quantity, Price, Display_Name, CreatedAt, UpdatedAt
                )
                VALUES (
                    @CartId, @ProductId, @Variant_Id, @Variant_Name, @Variant_Packaging,
                    @Quantity, @Price, @Display_Name, GETDATE(), GETDATE()
                )";

                    _dapper.ExecuteSql(insertSql, new
                    {
                        CartId = cartId.Value,
                        ProductId = dto.Product_Id,
                        Variant_Id = dto.Variant_Id,
                        Variant_Name = variantName,
                        Variant_Packaging = variantPackaging,
                        Quantity = dto.Quantity,
                        Price = finalPrice,
                        Display_Name = displayName
                    });
                }

                return Ok(new { success = true, message = "Product added to cart" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/cart/update
        [HttpPut("update")]
        public IActionResult UpdateCartItem([FromBody] UpdateCartItemDto dto)
        {
            try
            {
                int? userId = GetUserId();

                if (!userId.HasValue)
                {
                    return Unauthorized(new { error = "Please login to update cart" });
                }

                string sql = @"
                    UPDATE ci 
                    SET ci.Quantity = @Quantity, ci.UpdatedAt = GETDATE()
                    FROM CartItems ci
                    INNER JOIN ShoppingCart c ON ci.Cart_Id = c.Cart_Id
                    WHERE ci.CartItem_Id = @CartItemId AND c.User_Id = @UserId";

                bool updated = _dapper.ExecuteSql(sql, new
                {
                    Quantity = dto.Quantity,
                    CartItemId = dto.CartItem_Id,
                    UserId = userId.Value
                });

                if (!updated)
                    return NotFound(new { error = "Cart item not found" });

                return Ok(new { success = true, message = "Cart updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/cart/remove/{cartItemId}
        [HttpDelete("remove/{cartItemId}")]
        public IActionResult RemoveFromCart(int cartItemId)
        {
            try
            {
                int? userId = GetUserId();

                if (!userId.HasValue)
                {
                    return Unauthorized(new { error = "Please login to remove items from cart" });
                }

                string sql = @"
                    DELETE ci
                    FROM CartItems ci
                    INNER JOIN ShoppingCart c ON ci.Cart_Id = c.Cart_Id
                    WHERE ci.CartItem_Id = @CartItemId AND c.User_Id = @UserId";

                bool deleted = _dapper.ExecuteSql(sql, new { CartItemId = cartItemId, UserId = userId.Value });

                if (!deleted)
                    return NotFound(new { error = "Cart item not found" });

                return Ok(new { success = true, message = "Item removed from cart" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/cart/clear
        [HttpDelete("clear")]
        public IActionResult ClearCart()
        {
            try
            {
                int? userId = GetUserId();

                if (!userId.HasValue)
                {
                    return Unauthorized(new { error = "Please login to clear cart" });
                }

                string sql = @"
                    DELETE ci
                    FROM CartItems ci
                    INNER JOIN ShoppingCart c ON ci.Cart_Id = c.Cart_Id
                    WHERE c.User_Id = @UserId";

                _dapper.ExecuteSql(sql, new { UserId = userId.Value });

                return Ok(new { success = true, message = "Cart cleared" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
