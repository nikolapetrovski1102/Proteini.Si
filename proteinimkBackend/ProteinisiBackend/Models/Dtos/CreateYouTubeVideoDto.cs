namespace ProteinisiBackend.Models.Dtos
{
    // For CREATE - admin will upload thumbnail
    public class CreateYouTubeVideoDto
    {
        public string VideoUrl { get; set; }
        public IFormFile Thumbnail { get; set; }  // The uploaded thumbnail file
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public int DisplayOrder { get; set; }
        public string? CreatedBy { get; set; }
    }

    // For UPDATE
    public class UpdateYouTubeVideoDto
    {
        public int Id { get; set; }
        public string VideoUrl { get; set; }
        public IFormFile? Thumbnail { get; set; }  // Optional for update
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public int DisplayOrder { get; set; }
        public string? UpdatedBy { get; set; }
    }

    // For RESPONSE (when returning data to frontend)
    public class YouTubeVideoResponseDto
    {
        public int Id { get; set; }
        public string VideoUrl { get; set; }
        public string ThumbnailPath { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int ViewCount { get; set; }
        public int LikeCount { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // For reordering videos (drag and drop)
    public class ReorderYouTubeVideoDto
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }
    }
}