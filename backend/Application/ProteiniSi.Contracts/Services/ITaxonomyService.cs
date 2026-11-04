using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface ITaxonomyService
{
    Task<List<ProductCategory>> GetCategoriesAsync();
    Task<int> CreateCategoryAsync(CategoryWriteDto category);
    Task UpdateCategoryAsync(int id, CategoryWriteDto category);
    Task DeleteCategoryAsync(int id);
    Task<ProductCategory?> ResolveCategorySlugAsync(string slug);
}
