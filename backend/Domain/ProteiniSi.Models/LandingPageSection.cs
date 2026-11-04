namespace ProteiniSi.Models;

public class LandingPageSection
{
    public int Id { get; set; }
    public string SectionType { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? ImagePath { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
