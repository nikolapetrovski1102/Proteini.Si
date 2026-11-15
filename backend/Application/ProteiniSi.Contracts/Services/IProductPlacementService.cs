using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IProductPlacementService
{
    Task<ProductPlacementAdmin> GetAdminAsync();
    Task SaveAsync(SaveProductPlacementsDto dto);
}
