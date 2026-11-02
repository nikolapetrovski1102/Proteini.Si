namespace ProteiniSi.Api.Services.Interfaces;

public interface IImageStorageService
{
    Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix);
}
