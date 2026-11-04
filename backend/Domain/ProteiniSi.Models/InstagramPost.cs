namespace ProteiniSi.Models;

public class InstagramPost
{
    public int Id { get; set; }
    public string PostUrl { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int LikeCount { get; set; }
    public string? PostedBy { get; set; }
    public DateTime? PostedDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
