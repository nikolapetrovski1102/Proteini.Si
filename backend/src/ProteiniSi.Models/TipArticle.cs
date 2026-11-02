namespace ProteiniSi.Models;

public class TipArticle
{
    public int Id { get; set; }
    public string Category { get; set; } = "news";
    public string Title { get; set; } = string.Empty;
    public string? TitleAl { get; set; }
    public string Subtitle { get; set; } = string.Empty;
    public string? SubtitleAl { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ContentAl { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? ImagePath { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
