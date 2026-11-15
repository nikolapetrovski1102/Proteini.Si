using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IHomeShowcaseProvider
{
    Task<HomeShowcase?> GetAsync(string key);
    Task UpdateAsync(string key, UpdateHomeShowcaseDto showcase, string? updatedBy);
}
