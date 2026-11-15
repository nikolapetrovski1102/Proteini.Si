using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IHomeShowcaseService
{
    Task<HomeShowcase> GetAsync();
    Task UpdateAsync(UpdateHomeShowcaseDto showcase, string? updatedBy);
}
