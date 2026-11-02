using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class HomepageCardForm
{
    public string Section { get; set; } = "goal";
    public string TitleMk { get; set; } = string.Empty;
    public string? TitleAl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string FilterValue { get; set; } = string.Empty;
    public string? DestinationUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public IFormFile? Image { get; set; }
}
