using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class AboutCompanyProvider(ISqlHelper sql) : IAboutCompanyProvider
{
    public Task<List<AboutCompanySection>> GetActiveAsync() =>
        sql.QueryAsync<AboutCompanySection>(StoredProcedures.AboutCompany.GetActive);

    public Task<List<AboutCompanySection>> GetAllAsync() =>
        sql.QueryAsync<AboutCompanySection>(StoredProcedures.AboutCompany.GetAll);

    public Task<AboutCompanySection?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<AboutCompanySection>(StoredProcedures.AboutCompany.GetById, new { Id = id });

    public async Task<int> CreateAsync(CreateAboutCompanySectionDto section, string? thumbnailPath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AboutCompany.Create, new
        {
            section.SectionType,
            section.Title,
            section.VideoUrl,
            VideoThumbnailPath = thumbnailPath,
            section.Content,
            section.DisplayOrder,
            section.CreatedBy
        });

    public async Task<bool> UpdateAsync(UpdateAboutCompanySectionDto section, string? thumbnailPath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AboutCompany.Update, new
        {
            section.Id,
            section.SectionType,
            section.Title,
            section.VideoUrl,
            VideoThumbnailPath = thumbnailPath,
            section.Content,
            section.DisplayOrder,
            section.IsActive,
            section.UpdatedBy
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.AboutCompany.Delete, new { Id = id }) > 0;

    public Task ReorderAsync(IEnumerable<ReorderItemDto> items) =>
        sql.ExecuteAsync(StoredProcedures.AboutCompany.Reorder, new
        {
            Items = TableParameters.IdOrderList(items.Select(item => (item.Id, item.DisplayOrder)))
        });
}
