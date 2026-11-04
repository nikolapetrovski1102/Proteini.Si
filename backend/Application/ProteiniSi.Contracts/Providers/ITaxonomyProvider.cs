using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface ITaxonomyProvider
{
    Task<List<ProductCategory>> GetCategoriesAsync();
    Task<(CategoryWriteResult Result, int? Id)> CreateCategoryAsync(string name, string slug, int? parentId, int displayOrder);
    Task<CategoryWriteResult> UpdateCategoryAsync(int id, string name, string slug, int? parentId, int displayOrder);
    Task<bool?> DeleteCategoryAsync(int id);
    Task<ProductCategory?> ResolveCategorySlugAsync(string slug);
}
