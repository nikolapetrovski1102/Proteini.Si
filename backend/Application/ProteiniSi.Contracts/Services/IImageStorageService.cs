using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Contracts.Services;

public interface IImageStorageService
{
    Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix);
}
