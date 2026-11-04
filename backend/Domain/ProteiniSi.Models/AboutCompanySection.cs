namespace ProteiniSi.Models;

public class AboutCompanySection
{
    public int Id { get; set; }
    public string SectionType { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? VideoUrl { get; set; }
    public string? VideoThumbnailPath { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
