using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class TaxonomyProvider(ISqlHelper sql) : ITaxonomyProvider
{
    public Task<List<ProductCategory>> GetCategoriesAsync() =>
        sql.QueryAsync<ProductCategory>(StoredProcedures.Taxonomy.GetCategories);

    public async Task<(CategoryWriteResult Result, int? Id)> CreateCategoryAsync(string name, string slug, int? parentId, int displayOrder)
    {
        var row = await sql.QuerySingleOrDefaultAsync<CreateRow>(StoredProcedures.Taxonomy.CreateCategory, new
        {
            Name = name,
            Slug = slug,
            ParentId = parentId,
            DisplayOrder = displayOrder
        });

        return ((CategoryWriteResult)row!.Result, row.Id);
    }

    public async Task<CategoryWriteResult> UpdateCategoryAsync(int id, string name, string slug, int? parentId, int displayOrder) =>
        (CategoryWriteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Taxonomy.UpdateCategory, new
        {
            Id = id,
            Name = name,
            Slug = slug,
            ParentId = parentId,
            DisplayOrder = displayOrder
        });

    public async Task<bool?> DeleteCategoryAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Taxonomy.DeleteCategory, new { Id = id }) switch
        {
            0 => true,
            1 => null,
            _ => false
        };

    public Task<ProductCategory?> ResolveCategorySlugAsync(string slug) =>
        sql.QuerySingleOrDefaultAsync<ProductCategory>(StoredProcedures.Taxonomy.ResolveCategorySlug, new { Slug = slug });

    private sealed record CreateRow(int Result, int? Id);
}
