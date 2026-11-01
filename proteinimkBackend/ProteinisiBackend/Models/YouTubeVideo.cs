namespace ProteinisiBackend.Models
{
    public class YouTubeVideo
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
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}