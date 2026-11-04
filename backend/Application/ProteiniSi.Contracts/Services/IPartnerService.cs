using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IPartnerService
{
    Task<List<Partner>> GetActiveAsync();
    Task<List<Partner>> GetAllAsync();
    Task<List<Partner>> GetActiveByTypeAsync(string type);
    Task<Partner> GetByIdAsync(int id);
    Task<(int Id, string ImagePath)> CreateAsync(CreatePartnerDto partner);
    Task<string> UpdateAsync(UpdatePartnerDto partner);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<ReorderItemDto>? items);
    Task<string> UploadImageAsync(IFormFile? file, string type);
}
