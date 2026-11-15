using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

/** Admin brand form (multipart). Images are optional; Remove* clears the current one. */
public class BrandWriteDto
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public int DisplayOrder { get; set; }
    public IFormFile? Logo { get; set; }
    public IFormFile? HeaderImage { get; set; }
    public bool RemoveLogo { get; set; }
    public bool RemoveHeaderImage { get; set; }
}
