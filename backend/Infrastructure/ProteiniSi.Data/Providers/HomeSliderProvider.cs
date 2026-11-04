using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class HomeSliderProvider(ISqlHelper sql) : IHomeSliderProvider
{
    public Task<List<HomeSlider>> GetActiveAsync() =>
        sql.QueryAsync<HomeSlider>(StoredProcedures.HomeSlider.GetActive);

    public Task<List<HomeSlider>> GetAllAsync() =>
        sql.QueryAsync<HomeSlider>(StoredProcedures.HomeSlider.GetAll);

    public Task<HomeSlider?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<HomeSlider>(StoredProcedures.HomeSlider.GetById, new { Id = id });

    public async Task<(int Id, int DisplayOrder)> CreateAsync(CreateHomeSliderDto slider, string imagePath, string? mobileImagePath)
    {
        var created = await sql.QuerySingleOrDefaultAsync<CreatedRow>(StoredProcedures.HomeSlider.Create, new
        {
            ImageUrl = imagePath,
            MobileImageUrl = mobileImagePath,
            slider.ClickUrl,
            slider.Title
        });

        return (created!.Id, created.DisplayOrder);
    }

    public async Task<bool> UpdateAsync(int id, UpdateHomeSliderDto slider) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.HomeSlider.Update, new
        {
            Id = id,
            slider.ClickUrl,
            slider.Title,
            slider.IsActive
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.HomeSlider.Delete, new { Id = id }) > 0;

    public Task<List<int>> ReorderAsync(IEnumerable<ReorderItemDto> items) =>
        sql.QueryAsync<int>(StoredProcedures.HomeSlider.Reorder, new
        {
            Items = TableParameters.IdOrderList(items.Select(item => (item.Id, item.DisplayOrder)))
        });

    private sealed record CreatedRow(int Id, int DisplayOrder);
}
