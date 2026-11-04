using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class CreateYouTubeVideoDto
{
    public string VideoUrl { get; set; } = null!;
    public IFormFile Thumbnail { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DisplayOrder { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateYouTubeVideoDto
{
    public int Id { get; set; }
    public string VideoUrl { get; set; } = null!;
    public IFormFile? Thumbnail { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int ViewCount { get; set; }
    public int LikeCount { get; set; }
    public int DisplayOrder { get; set; }
    public string? UpdatedBy { get; set; }
}
