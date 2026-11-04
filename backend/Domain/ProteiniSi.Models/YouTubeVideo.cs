namespace ProteiniSi.Models;

public class YouTubeVideo
{
    public int Id { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public string ThumbnailPath { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
