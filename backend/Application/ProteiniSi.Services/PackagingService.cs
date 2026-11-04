using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class PackagingService(IPackagingProvider provider) : IPackagingService
{
    public Task<List<Packaging>> GetActiveAsync() => provider.GetActiveAsync();

    public async Task<Packaging> GetByIdAsync(int id) =>
        await provider.GetActiveByIdAsync(id) ?? throw NotFound();

    public async Task<int> CreateAsync(CreatePackagingDto packaging)
    {
        if (string.IsNullOrEmpty(packaging.Packaging_Name))
            throw new BadRequestException("Packaging name is required", new { message = "Packaging name is required" });

        return await provider.CreateAsync(packaging);
    }

    public async Task UpdateAsync(UpdatePackagingDto packaging)
    {
        if (!await provider.UpdateAsync(packaging))
            throw NotFound();
    }

    public async Task DeleteAsync(int id)
    {
        if (!await provider.DeactivateAsync(id))
            throw NotFound();
    }

    private static NotFoundException NotFound() =>
        new("Packaging not found", new { message = "Packaging not found" });
}
