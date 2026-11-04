using Microsoft.AspNetCore.Http;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IInstagramPostService
{
    Task<List<InstagramPost>> GetActiveAsync();
    Task<InstagramPost> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateInstagramPostDto post);
    Task UpdateAsync(UpdateInstagramPostDto post);
    Task DeleteAsync(int id);
    Task<string> UploadImageAsync(IFormFile? file);
}
