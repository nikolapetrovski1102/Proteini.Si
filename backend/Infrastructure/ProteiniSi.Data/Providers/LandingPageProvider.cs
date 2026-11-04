using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class LandingPageProvider(ISqlHelper sql) : ILandingPageProvider
{
    public Task<List<LandingPageSection>> GetActiveAsync() =>
        sql.QueryAsync<LandingPageSection>(StoredProcedures.LandingPage.GetActive);

    public Task<List<LandingPageSection>> GetAllAsync() =>
        sql.QueryAsync<LandingPageSection>(StoredProcedures.LandingPage.GetAll);

    public Task<LandingPageSection?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<LandingPageSection>(StoredProcedures.LandingPage.GetById, new { Id = id });

    public async Task<int> CreateAsync(CreateLandingPageSectionDto section, string? imagePath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.LandingPage.Create, new
        {
            section.SectionType,
            section.Title,
            ImagePath = imagePath,
            section.Content,
            section.DisplayOrder,
            section.CreatedBy
        });

    public async Task<bool> UpdateAsync(UpdateLandingPageSectionDto section, string? imagePath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.LandingPage.Update, new
        {
            section.Id,
            section.SectionType,
            section.Title,
            ImagePath = imagePath,
            section.Content,
            section.DisplayOrder,
            section.IsActive,
            section.UpdatedBy
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.LandingPage.Delete, new { Id = id }) > 0;

    public Task ReorderAsync(IEnumerable<ReorderItemDto> items) =>
        sql.ExecuteAsync(StoredProcedures.LandingPage.Reorder, new
        {
            Items = TableParameters.IdOrderList(items.Select(item => (item.Id, item.DisplayOrder)))
        });
}
