using ProteiniSi.Api.Data;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Providers.Interfaces;

namespace ProteiniSi.Api.Providers.Implementation;

public class BranchLocationProvider(ISqlHelper sql) : IBranchLocationProvider
{
    public Task<List<BranchLocation>> GetActiveAsync(string? type) =>
        sql.QueryAsync<BranchLocation>(StoredProcedures.BranchLocations.GetActive, new { Type = type });

    public Task<List<BranchLocation>> GetAllAsync() =>
        sql.QueryAsync<BranchLocation>(StoredProcedures.BranchLocations.GetAll);

    public async Task<int> CreateAsync(BranchLocation location) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.BranchLocations.Create, new
        {
            location.Type,
            location.Name,
            location.City,
            location.Address,
            location.Phone,
            location.Email,
            location.WorkingHoursMonFri,
            location.WorkingHoursSat,
            location.WorkingHoursSun,
            location.Coordinates,
            location.DisplayOrder,
            location.IsActive
        });

    public async Task<bool> UpdateAsync(BranchLocation location) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.BranchLocations.Update, new
        {
            location.Id,
            location.Type,
            location.Name,
            location.City,
            location.Address,
            location.Phone,
            location.Email,
            location.WorkingHoursMonFri,
            location.WorkingHoursSat,
            location.WorkingHoursSun,
            location.Coordinates,
            location.DisplayOrder,
            location.IsActive
        }) > 0;

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.BranchLocations.Delete, new { Id = id }) > 0;
}
