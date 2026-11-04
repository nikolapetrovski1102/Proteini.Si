using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class CreateHomeSliderDto
{
    public IFormFile Image { get; set; } = null!;
    public IFormFile? MobileImage { get; set; }
    public string? ClickUrl { get; set; }
    public string? Title { get; set; }
}

public class UpdateHomeSliderDto
{
    public string? ClickUrl { get; set; }
    public string? Title { get; set; }
    public bool IsActive { get; set; }
}

public record CreatedHomeSliderDto(int SliderId, string ImagePath, string? MobileImagePath, int DisplayOrder);
