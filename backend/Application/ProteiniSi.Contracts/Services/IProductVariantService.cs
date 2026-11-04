using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IProductVariantService
{
    Task<List<ProductVariantDto>> GetByProductAsync(int productId);
    Task<ProductVariantDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateProductVariantDto variant);
    Task<bool> UpdateAsync(UpdateProductVariantDto variant);
    Task<bool> DeleteAsync(int id);
    Task<string> UploadImageAsync(IFormFile image, int? variantId);
    Task<List<VariantGalleryDto>> GetGalleryAsync(int variantId);
    Task<(VariantGalleryCreated Gallery, string ImagePath)> UploadGalleryImageAsync(IFormFile image, int variantId);
    Task<bool> DeleteGalleryImageAsync(int galleryId);
    Task SetMainGalleryImageAsync(SetMainVariantGalleryImageDto dto);
    Task<VariantNutritionView?> GetNutritionAsync(int variantId);
    Task<bool> SaveNutritionAsync(int variantId, VariantNutritionDto nutrition);
    Task DeleteNutritionAsync(int variantId);
    Task<NutritionTableData?> PasteNutritionTableAsync(int variantId, string rawText);
    Task<NutritionTableData?> GetNutritionTableAsync(int variantId);
    Task<bool> UpdateNutritionTableAsync(int variantId, UpdateNutritionTableDto table);
    Task<bool> DeleteNutritionTableAsync(int variantId);
    Task<dynamic?> GetParentProductAsync(int variantId);
    Task<dynamic?> GetWithParentAsync(int id);
}
