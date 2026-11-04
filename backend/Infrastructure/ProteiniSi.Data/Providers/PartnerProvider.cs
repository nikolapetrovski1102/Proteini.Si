using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class PartnerProvider(ISqlHelper sql) : IPartnerProvider
{
    public Task<List<Partner>> GetActiveAsync() =>
        sql.QueryAsync<Partner>(StoredProcedures.Partners.GetActive);

    public Task<List<Partner>> GetAllAsync() =>
        sql.QueryAsync<Partner>(StoredProcedures.Partners.GetAll);

    public Task<List<Partner>> GetActiveByTypeAsync(string type) =>
        sql.QueryAsync<Partner>(StoredProcedures.Partners.GetActiveByType, new { Type = type });

    public Task<Partner?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<Partner>(StoredProcedures.Partners.GetById, new { Id = id });

    public async Task<int> CreateAsync(CreatePartnerDto partner, string imagePath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Partners.Create, new
        {
            partner.Type,
            partner.Name,
            ImagePath = imagePath,
            partner.Url,
            partner.DisplayOrder,
            partner.CreatedBy
        });

    public async Task<bool> UpdateAsync(UpdatePartnerDto partner, string imagePath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Partners.Update, new
        {
            partner.Id,
            partner.Type,
            partner.Name,
            ImagePath = imagePath,
            partner.Url,
            partner.DisplayOrder,
            partner.IsActive,
            partner.UpdatedBy
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Partners.Delete, new { Id = id }) > 0;

    public Task ReorderAsync(IEnumerable<ReorderItemDto> items) =>
        sql.ExecuteAsync(StoredProcedures.Partners.Reorder, new
        {
            Items = TableParameters.IdOrderList(items.Select(item => (item.Id, item.DisplayOrder)))
        });
}
