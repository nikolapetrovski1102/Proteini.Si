using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IProductVariantProvider
{
    Task<List<ProductVariantDto>> GetByProductAsync(int productId);
    Task<ProductVariantDto?> GetActiveByIdAsync(int id);
    Task<dynamic?> GetWithParentAsync(int id);
    Task<dynamic?> GetParentProductAsync(int variantId);
    Task<bool> ExistsActiveAsync(int variantId);
    Task<int?> CreateAsync(CreateProductVariantDto variant, VariantWriteValues values);
    Task<bool> UpdateAsync(UpdateProductVariantDto variant, VariantWriteValues values);
    Task<DeletedImage?> DeleteAsync(int id);
    Task<List<VariantGalleryDto>> GetGalleryAsync(int variantId);
    Task<VariantGalleryCreated> CreateGalleryImageAsync(int variantId, string imagePath);
    Task<DeletedImage?> DeleteGalleryImageAsync(int galleryId);
    Task SetMainGalleryImageAsync(int variantId, int galleryId);
    Task<VariantNutritionData?> GetNutritionAsync(int variantId);
    Task<bool> SaveNutritionAsync(int variantId, List<NutritionColumnWrite> columns, List<NutritionRowWrite> rows);
    Task DeleteNutritionAsync(int variantId);
    Task<bool> SetNutritionTableAsync(int variantId, string? tableJson, string? columnsJson, string? rowsJson);
    Task<string?> GetNutritionTableJsonAsync(int variantId);
}
