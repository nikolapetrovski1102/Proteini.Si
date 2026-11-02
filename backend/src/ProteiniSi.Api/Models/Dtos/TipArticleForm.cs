namespace ProteiniSi.Api.Models.Dtos;

public class TipArticleForm
{
    public int Id { get; set; }
    public string? Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? TitleAl { get; set; }
    public string? Subtitle { get; set; }
    public string? SubtitleAl { get; set; }
    public string? Content { get; set; }
    public string? ContentAl { get; set; }
    public string? Slug { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public IFormFile? Image { get; set; }
}
