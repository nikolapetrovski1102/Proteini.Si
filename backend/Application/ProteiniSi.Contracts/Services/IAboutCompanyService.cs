using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IAboutCompanyService
{
    Task<List<AboutCompanySection>> GetActiveAsync();
    Task<List<AboutCompanySection>> GetAllAsync();
    Task<AboutCompanySection> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateAboutCompanySectionDto section);
    Task UpdateAsync(UpdateAboutCompanySectionDto section);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<ReorderItemDto>? items);
    Task<string> UploadThumbnailAsync(IFormFile? file);
}
