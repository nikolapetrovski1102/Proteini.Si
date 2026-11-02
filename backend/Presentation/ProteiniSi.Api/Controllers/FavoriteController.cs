// Controllers/FavoriteController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models.DTOs;
using System.Security.Claims;
using Dapper;

namespace ProteiniSi.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class FavoriteController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public FavoriteController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
            return int.Parse(userIdClaim);
        }

        [HttpPost("add/{productId}")]
        public IActionResult AddFavorite(int productId)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Check if already exists
                string checkSql = "SELECT COUNT(1) FROM FavoriteProducts WHERE UserId = @UserId AND ProductId = @ProductId";
                var exists = _dapper.LoadDataSingle<int>(checkSql, new { UserId = userId, ProductId = productId });

                if (exists > 0)
                {
                    return Ok(new FavoriteResponseDto
                    {
                        Success = false,
                        Message = "Product is already in favorites"
                    });
                }

                // Insert favorite
                string insertSql = @"
INSERT INTO FavoriteProducts (UserId, ProductId, CreatedAt)
VALUES (@UserId, @ProductId, GETDATE());
SELECT CAST(SCOPE_IDENTITY() AS INT);
";
                var favoriteId = _dapper.LoadDataSingle<int>(insertSql, new { UserId = userId, ProductId = productId });

                // Get product details
                string productSql = @"
SELECT 
    p.Product_Id AS ProductId,
    p.Name AS ProductName,
    p.Price AS ProductPrice,
    p.Img AS ProductImage
FROM Products p
WHERE p.Product_Id = @ProductId
";
                var product = _dapper.LoadDataSingleOrDefault<dynamic>(productSql, new { ProductId = productId });

                return Ok(new FavoriteResponseDto
                {
                    Success = true,
                    Message = "Product added to favorites successfully",
                    Data = new FavoriteDto
                    {
                        FavoriteId = favoriteId,
                        UserId = userId,
                        ProductId = productId,
                        CreatedAt = DateTime.Now,
                        ProductName = product?.ProductName,
                        ProductPrice = product?.ProductPrice ?? 0,
                        ProductImage = product?.ProductImage
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new FavoriteResponseDto
                {
                    Success = false,
                    Message = $"Error adding favorite: {ex.Message}"
                });
            }
        }

        [HttpDelete("remove/{productId}")]
        public IActionResult RemoveFavorite(int productId)
        {
            try
            {
                var userId = GetCurrentUserId();

                string deleteSql = "DELETE FROM FavoriteProducts WHERE UserId = @UserId AND ProductId = @ProductId";
                var rowsAffected = _dapper.ExecuteSqlWithRowCount(deleteSql, new { UserId = userId, ProductId = productId });

                if (rowsAffected > 0)
                {
                    return Ok(new FavoriteResponseDto
                    {
                        Success = true,
                        Message = "Product removed from favorites successfully"
                    });
                }

                return Ok(new FavoriteResponseDto
                {
                    Success = false,
                    Message = "Product not found in favorites"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new FavoriteResponseDto
                {
                    Success = false,
                    Message = $"Error removing favorite: {ex.Message}"
                });
            }
        }

        [HttpGet("my-favorites")]
        public IActionResult GetMyFavorites()
        {
            try
            {
                var userId = GetCurrentUserId();

                string sql = @"
SELECT 
    fp.FavoriteId,
    fp.UserId,
    fp.ProductId,
    fp.CreatedAt,
    p.Name AS ProductName,
    p.Price AS ProductPrice,
    p.Img AS ProductImage
FROM FavoriteProducts fp
INNER JOIN Products p ON fp.ProductId = p.Product_Id
WHERE fp.UserId = @UserId
ORDER BY fp.CreatedAt DESC
";

                var favorites = _dapper.LoadData<FavoriteDto>(sql, new { UserId = userId });
                var favoriteList = favorites.ToList();

                return Ok(new FavoritesListResponseDto
                {
                    Success = true,
                    Message = "Favorites retrieved successfully",
                    Data = favoriteList,
                    TotalCount = favoriteList.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new FavoritesListResponseDto
                {
                    Success = false,
                    Message = $"Error getting favorites: {ex.Message}",
                    Data = new List<FavoriteDto>(),
                    TotalCount = 0
                });
            }
        }

        [HttpGet("check/{productId}")]
        public IActionResult IsFavorite(int productId)
        {
            try
            {
                var userId = GetCurrentUserId();

                string sql = "SELECT COUNT(1) FROM FavoriteProducts WHERE UserId = @UserId AND ProductId = @ProductId";
                var count = _dapper.LoadDataSingle<int>(sql, new { UserId = userId, ProductId = productId });

                return Ok(new IsFavoriteResponseDto
                {
                    IsFavorite = count > 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new IsFavoriteResponseDto
                {
                    IsFavorite = false
                });
            }
        }

        [HttpGet("count/{productId}")]
        [AllowAnonymous]
        public IActionResult GetFavoriteCount(int productId)
        {
            try
            {
                string sql = "SELECT COUNT(1) FROM FavoriteProducts WHERE ProductId = @ProductId";
                var count = _dapper.LoadDataSingle<int>(sql, new { ProductId = productId });

                return Ok(new { ProductId = productId, FavoriteCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}