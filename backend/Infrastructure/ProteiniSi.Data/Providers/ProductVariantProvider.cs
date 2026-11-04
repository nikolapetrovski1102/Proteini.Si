using System.Text.Json;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class ProductVariantProvider(ISqlHelper sql) : IProductVariantProvider
{
    public Task<List<ProductVariantDto>> GetByProductAsync(int productId) =>
        sql.QueryAsync<ProductVariantDto>(StoredProcedures.ProductVariants.GetByProduct, new { ProductId = productId });

    public Task<ProductVariantDto?> GetActiveByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<ProductVariantDto>(StoredProcedures.ProductVariants.GetActiveById, new { Id = id });

    public async Task<dynamic?> GetWithParentAsync(int id) =>
        await sql.QuerySingleOrDefaultAsync<dynamic>(StoredProcedures.ProductVariants.GetWithParent, new { Id = id });

    public async Task<dynamic?> GetParentProductAsync(int variantId) =>
        await sql.QuerySingleOrDefaultAsync<dynamic>(StoredProcedures.ProductVariants.GetParentProduct, new { VariantId = variantId });

    public async Task<bool> ExistsActiveAsync(int variantId) =>
        await sql.ExecuteScalarAsync<bool>(StoredProcedures.ProductVariants.ExistsActive, new { VariantId = variantId });

    public Task<int?> CreateAsync(CreateProductVariantDto variant, VariantWriteValues values) =>
        sql.ExecuteScalarAsync<int?>(StoredProcedures.ProductVariants.Create, new
        {
            ProductId = variant.Product_Id,
            values.Sku,
            FlavorId = variant.Flavor_Id,
            FlavorName = variant.Flavor_Name,
            PackagingId = variant.Packaging_Id,
            PackagingName = variant.Packaging_Name,
            ResolvePackagingName = values.PackagingLookupName,
            WeightGrams = values.PackagingWeight,
            HasWeight = values.HasPackagingWeight,
            variant.Price,
            DDVPercentage = variant.DDV_Percentage,
            ComparePrice = variant.Compare_Price,
            variant.Quantity,
            LowStockThreshold = variant.Low_Stock_Threshold,
            VariantName = variant.Variant_Name,
            values.OptionType,
            VariantImagePath = variant.Variant_Image_Path,
            variant.Ingredients,
            NutritionInfo = variant.Nutrition_Info,
            variant.Description,
            DisplayOrder = variant.Display_Order,
            variant.IsDefault,
            values.LoyaltyPercentage
        });

    public async Task<bool> UpdateAsync(UpdateProductVariantDto variant, VariantWriteValues values) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.ProductVariants.Update, new
        {
            VariantId = variant.Variant_Id,
            values.Sku,
            FlavorId = variant.Flavor_Id,
            FlavorName = variant.Flavor_Name,
            PackagingId = variant.Packaging_Id,
            PackagingName = variant.Packaging_Name,
            ResolvePackagingName = values.PackagingLookupName,
            WeightGrams = values.PackagingWeight,
            HasWeight = values.HasPackagingWeight,
            variant.Price,
            DDVPercentage = variant.DDV_Percentage,
            ComparePrice = variant.Compare_Price,
            variant.Quantity,
            LowStockThreshold = variant.Low_Stock_Threshold,
            VariantName = variant.Variant_Name,
            values.OptionType,
            VariantImagePath = variant.Variant_Image_Path,
            variant.Ingredients,
            NutritionInfo = variant.Nutrition_Info,
            variant.Description,
            DisplayOrder = variant.Display_Order,
            variant.IsActive,
            variant.IsDefault,
            values.LoyaltyPercentage
        }) > 0;

    public Task<DeletedImage?> DeleteAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<DeletedImage>(StoredProcedures.ProductVariants.Delete, new { Id = id });

    public Task<List<VariantGalleryDto>> GetGalleryAsync(int variantId) =>
        sql.QueryAsync<VariantGalleryDto>(StoredProcedures.VariantGallery.GetByVariant, new { VariantId = variantId });

    public async Task<VariantGalleryCreated> CreateGalleryImageAsync(int variantId, string imagePath) =>
        (await sql.QuerySingleOrDefaultAsync<VariantGalleryCreated>(StoredProcedures.VariantGallery.Create, new
        {
            VariantId = variantId,
            ImagePath = imagePath
        }))!;

    public Task<DeletedImage?> DeleteGalleryImageAsync(int galleryId) =>
        sql.QuerySingleOrDefaultAsync<DeletedImage>(StoredProcedures.VariantGallery.Delete, new { GalleryId = galleryId });

    public Task SetMainGalleryImageAsync(int variantId, int galleryId) =>
        sql.ExecuteAsync(StoredProcedures.VariantGallery.SetMain, new { VariantId = variantId, GalleryId = galleryId });

    public Task<VariantNutritionData?> GetNutritionAsync(int variantId) =>
        sql.QueryMultipleAsync(StoredProcedures.VariantNutrition.Get, new { VariantId = variantId }, async grid =>
        {
            if (!await grid.ReadSingleAsync<bool>())
                return null;

            return (VariantNutritionData?)new VariantNutritionData
            {
                Columns = (await grid.ReadAsync<VariantNutritionColumn>()).ToList(),
                Rows = (await grid.ReadAsync<VariantNutritionRow>()).ToList(),
                Values = (await grid.ReadAsync<VariantNutritionValue>()).ToList()
            };
        });

    public async Task<bool> SaveNutritionAsync(int variantId, List<NutritionColumnWrite> columns, List<NutritionRowWrite> rows) =>
        await sql.ExecuteScalarAsync<bool>(StoredProcedures.VariantNutrition.Save, new
        {
            VariantId = variantId,
            ColumnsJson = JsonSerializer.Serialize(columns),
            RowsJson = JsonSerializer.Serialize(rows)
        });

    public Task DeleteNutritionAsync(int variantId) =>
        sql.ExecuteAsync(StoredProcedures.VariantNutrition.Delete, new { VariantId = variantId });

    public async Task<bool> SetNutritionTableAsync(int variantId, string? tableJson, string? columnsJson, string? rowsJson) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.ProductVariants.SetNutritionTable, new
        {
            VariantId = variantId,
            TableJson = tableJson,
            ColumnsJson = columnsJson,
            RowsJson = rowsJson
        }) > 0;

    public Task<string?> GetNutritionTableJsonAsync(int variantId) =>
        sql.ExecuteScalarAsync<string>(StoredProcedures.ProductVariants.GetNutritionTable, new { VariantId = variantId });
}
