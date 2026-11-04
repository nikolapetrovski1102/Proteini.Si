using Dapper;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class ProductProvider(ISqlHelper sql) : IProductProvider
{
    public Task<(int TotalCount, List<ProductSearchResultDto> Products)> SearchAsync(ProductSearchQuery query) =>
        sql.QueryMultipleAsync(StoredProcedures.Products.Search, new
        {
            query.SearchTerm,
            query.SearchTermExact,
            query.BrandId,
            query.FlavorId,
            query.CategoryId,
            query.MinPrice,
            query.MaxPrice,
            query.NewInTheShop,
            query.ProductsOnSale,
            query.ProductsInTheOutlet,
            query.SortBy,
            query.SortDesc,
            query.Offset,
            query.PageSize
        }, async grid =>
        {
            var totalCount = await grid.ReadSingleAsync<int>();
            var products = (await grid.ReadAsync<ProductSearchResultDto>()).ToList();
            return (totalCount, products);
        });

    public Task<List<Product>> GetAllAsync() =>
        sql.QueryAsync<Product>(StoredProcedures.Products.GetAll);

    public Task<(ProductFilterOptionsDto Options, decimal MaximumPrice)> GetFilterOptionsAsync() =>
        sql.QueryMultipleAsync(StoredProcedures.Products.GetFilterOptions, null, async grid =>
        {
            var options = new ProductFilterOptionsDto
            {
                Categories = (await grid.ReadAsync<ProductCategory>()).ToList(),
                Sports = (await grid.ReadAsync<Sport>()).ToList(),
                Goals = (await grid.ReadAsync<Goal>()).ToList(),
                UseTimings = (await grid.ReadAsync<UseTiming>()).ToList(),
                Flavors = (await grid.ReadAsync<Flavor>()).ToList(),
                Brands = (await grid.ReadAsync<Brand>()).ToList(),
                Tags = (await grid.ReadAsync<ProductTag>()).ToList()
            };
            var maximumPrice = await grid.ReadSingleAsync<decimal>();
            return (options, maximumPrice);
        });

    public Task<List<ProductCategory>> GetCategoryTreeAsync() =>
        sql.QueryAsync<ProductCategory>(StoredProcedures.Products.GetCategoryTree);

    public Task<(int TotalCount, List<Product> Products)> FilterAsync(ProductFilterQuery query) =>
        sql.QueryMultipleAsync(StoredProcedures.Products.Filter, new
        {
            CategoryIds = TableParameters.IntList(query.CategoryIds),
            SportIds = TableParameters.IntList(query.SportIds),
            GoalIds = TableParameters.IntList(query.GoalIds),
            UseTimingIds = TableParameters.IntList(query.UseTimingIds),
            TagIds = TableParameters.IntList(query.TagIds),
            BrandIds = TableParameters.IntList(query.BrandIds),
            FlavorIds = TableParameters.IntList(query.FlavorIds),
            query.MinPrice,
            query.MaxPrice,
            query.InStock,
            query.OnSale,
            query.UpcomingPromotions,
            query.NewProducts,
            query.Outlet,
            query.GiftVouchers,
            query.JustForMe,
            query.HasSearch,
            SearchTerms = TableParameters.StringList(query.SearchTerms),
            query.SearchExact,
            query.SearchPrefix,
            query.SearchContains,
            query.SortBy,
            query.SortDesc,
            query.Offset,
            query.PageSize
        }, async grid =>
        {
            var totalCount = await grid.ReadSingleAsync<int>();
            var products = (await grid.ReadAsync<Product>()).ToList();
            return (totalCount, products);
        });

    public Task<ProductDetailsDto?> GetByIdAsync(int productId) =>
        sql.QueryMultipleAsync(StoredProcedures.Products.GetById, new { ProductId = productId }, async grid =>
        {
            var product = await grid.ReadFirstOrDefaultAsync<Product>();
            if (product == null)
                return null;

            return new ProductDetailsDto
            {
                Product = product,
                Categories = (await grid.ReadAsync<ProductCategory>()).ToList(),
                Sports = (await grid.ReadAsync<Sport>()).ToList(),
                Goals = (await grid.ReadAsync<Goal>()).ToList(),
                UseTimings = (await grid.ReadAsync<UseTiming>()).ToList(),
                Tags = (await grid.ReadAsync<ProductTag>()).ToList(),
                Variants = (await grid.ReadAsync<ProductVariantDto>()).ToList()
            };
        });

    public Task<bool> ExistsAsync(int productId) =>
        sql.ExecuteScalarAsync<bool>(StoredProcedures.Products.Exists, new { ProductId = productId });

    public Task<int> CreateAsync(ProductWrite product) =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Products.Create, WriteParameters(product, new
        {
            product.HasVariants,
            product.Variant_Display_Type
        }));

    public Task<ProductImageChange?> UpdateAsync(int productId, ProductWrite product, bool replaceImage, string? image) =>
        sql.QuerySingleOrDefaultAsync<ProductImageChange>(StoredProcedures.Products.Update, WriteParameters(product, new
        {
            ProductId = productId,
            ReplaceImage = replaceImage,
            Img = image
        }));

    public Task<ProductImageChange?> DeleteAsync(int productId) =>
        sql.QuerySingleOrDefaultAsync<ProductImageChange>(StoredProcedures.Products.Delete, new { ProductId = productId });

    public Task<ProductImageChange?> SetImageAsync(int productId, string? image, bool touchUpdatedAt) =>
        sql.QuerySingleOrDefaultAsync<ProductImageChange>(StoredProcedures.Products.SetImage,
            new { ProductId = productId, Img = image, TouchUpdatedAt = touchUpdatedAt });

    public async Task<ProductBulkResult> BulkSetQuantityAsync(IEnumerable<int> productIds, int quantity) =>
        (await sql.QuerySingleOrDefaultAsync<ProductBulkResult>(StoredProcedures.Products.BulkSetQuantity,
            new { ProductIds = TableParameters.IntList(productIds), Quantity = quantity }))!;

    public Task<int> BulkApplyDiscountAsync(IEnumerable<int> productIds, decimal discountMultiplier) =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Products.BulkApplyDiscount,
            new { ProductIds = TableParameters.IntList(productIds), DiscountMultiplier = discountMultiplier });

    public Task<int> BulkRemoveDiscountAsync(IEnumerable<int> productIds) =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Products.BulkRemoveDiscount,
            new { ProductIds = TableParameters.IntList(productIds) });

    public Task<List<ProductGallery>> GetGalleryAsync(int productId) =>
        sql.QueryAsync<ProductGallery>(StoredProcedures.ProductGallery.GetByProduct, new { ProductId = productId });

    public async Task<ProductGalleryCreated> CreateGalleryImageAsync(int productId, string imagePath, int? displayOrder) =>
        (await sql.QuerySingleOrDefaultAsync<ProductGalleryCreated>(StoredProcedures.ProductGallery.Create,
            new { ProductId = productId, ImagePath = imagePath, DisplayOrder = displayOrder }))!;

    public Task<string?> DeleteGalleryImageAsync(int galleryId) =>
        sql.QuerySingleOrDefaultAsync<string>(StoredProcedures.ProductGallery.Delete, new { GalleryId = galleryId });

    public Task ReorderGalleryAsync(IEnumerable<(int Id, int DisplayOrder)> items) =>
        sql.ExecuteAsync(StoredProcedures.ProductGallery.Reorder, new { Items = TableParameters.IdOrderList(items) });

    public Task<bool> SetMainGalleryImageAsync(int galleryId, int productId) =>
        sql.ExecuteScalarAsync<bool>(StoredProcedures.ProductGallery.SetMain, new { GalleryId = galleryId, ProductId = productId });

    private static DynamicParameters WriteParameters(ProductWrite product, object extra)
    {
        var parameters = new DynamicParameters(extra);
        parameters.AddDynamicParams(new
        {
            product.Name,
            product.Category,
            product.Quantity,
            product.Servings,
            product.GPerServing,
            product.GNutrition,
            product.Price,
            product.DDV_Percentage,
            product.DDV_Amount,
            product.Price_Without_DDV,
            product.Price_With_DDV,
            product.Brand_Id,
            product.Flavor_Id,
            product.MainDescriptions,
            product.OtherDescriptionTitle,
            product.OtherDescriptionText,
            product.NutritionValuesIngredients,
            product.NutritionValuesIngredientsDescription,
            product.NutritionInformation,
            product.InstructionsForUse,
            product.InstructionsForUseDescription,
            product.InstructionsOnHowToUseIt,
            product.NewInTheShop,
            product.ProductsOnSale,
            product.SalePrice,
            product.SaleEndDate,
            product.UpcomingPromotion,
            product.ShortExpiry,
            product.ExpiryDate,
            product.IsGiftVoucher,
            product.VoucherMinAmount,
            product.VoucherMaxAmount,
            product.NameAl,
            product.DescriptionAl,
            product.NutritionValuesIngredientsAl,
            product.NutritionValuesIngredientsDescriptionAl,
            product.NutritionInformationAl,
            product.InstructionsForUseAl,
            product.InstructionsForUseDescriptionAl,
            product.InstructionsOnHowToUseItAl,
            product.RecommendedForYou,
            product.ProductsInTheOutlet,
            product.JustForMe,
            product.LoyaltyPercentage,
            CategoryIds = TableParameters.IntList(product.CategoryIds),
            SportIds = TableParameters.IntList(product.SportIds),
            GoalIds = TableParameters.IntList(product.GoalIds),
            UseTimingIds = TableParameters.IntList(product.UseTimingIds),
            TagIds = TableParameters.IntList(product.TagIds)
        });
        return parameters;
    }
}
