using ProteiniSi.Api.Exceptions;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Providers.Interfaces;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Services.Implementation;

public class BranchLocationService(IBranchLocationProvider provider) : IBranchLocationService
{
    private static readonly string[] AllowedTypes = ["shop", "gym"];

    public Task<List<BranchLocation>> GetActiveAsync(string? type) =>
        provider.GetActiveAsync(string.IsNullOrWhiteSpace(type) ? null : type);

    public Task<List<BranchLocation>> GetAllAsync() => provider.GetAllAsync();

    public Task<int> CreateAsync(BranchLocation location)
    {
        EnsureValidType(location.Type);
        return provider.CreateAsync(location);
    }

    public async Task UpdateAsync(BranchLocation location)
    {
        EnsureValidType(location.Type);

        if (!await provider.UpdateAsync(location))
            throw new NotFoundException("Location not found");
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeleteAsync(id))
            throw new NotFoundException("Location not found");
    }

    private static void EnsureValidType(string type)
    {
        if (!AllowedTypes.Contains(type))
            throw new BadRequestException("Type must be shop or gym");
    }
}
