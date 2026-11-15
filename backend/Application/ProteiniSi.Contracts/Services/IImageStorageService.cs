using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Contracts.Services;

public interface IImageStorageService
{
    Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix);

    Task<string> SaveFileAsync(IFormFile file, string webFolder, string fileName);

    Task<string> SaveStreamAsync(Stream content, string webFolder, string fileName, CancellationToken cancellationToken = default);

    bool Exists(string webPath);

    void Delete(string? webPath);
}
