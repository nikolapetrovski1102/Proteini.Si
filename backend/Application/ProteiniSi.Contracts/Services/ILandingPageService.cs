using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface ILandingPageService
{
    Task<List<LandingPageSection>> GetActiveAsync();
    Task<List<LandingPageSection>> GetAllAsync();
    Task<LandingPageSection> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateLandingPageSectionDto section);
    Task UpdateAsync(UpdateLandingPageSectionDto section);
    Task DeleteAsync(int id);
    Task ReorderAsync(List<ReorderItemDto>? items);
    Task<string> UploadImageAsync(IFormFile? file);
}
