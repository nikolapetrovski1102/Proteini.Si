namespace ProteiniSi.Models;

public class HomepageCard
{
    public int Id { get; set; }
    public string Section { get; set; } = "goal";
    public string TitleMk { get; set; } = string.Empty;
    public string? TitleAl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string FilterValue { get; set; } = string.Empty;
    public string? DestinationUrl { get; set; }
    public string? ImagePath { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
