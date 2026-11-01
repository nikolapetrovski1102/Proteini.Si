namespace ProteinisiBackend.Models.Dtos
{
    public class CreateInstagramPostDto
    {
        public string PostUrl { get; set; }
        public string ImagePath { get; set; }
        public string? Description { get; set; }
        public int LikeCount { get; set; }
        public string? PostedBy { get; set; }
        public DateTime? PostedDate { get; set; }
        public string? CreatedBy { get; set; }
    }

    // For UPDATE (when admin edits a post)
    public class UpdateInstagramPostDto
    {
        public int Id { get; set; }
        public string PostUrl { get; set; }
        public string ImagePath { get; set; }
        public string? Description { get; set; }
        public int LikeCount { get; set; }
        public string? PostedBy { get; set; }
        public DateTime? PostedDate { get; set; }
        public string? UpdatedBy { get; set; }
    }

    // For RESPONSE (when returning data to frontend)
    public class InstagramPostResponseDto
    {
        public int Id { get; set; }
        public string PostUrl { get; set; }
        public string ImagePath { get; set; }
        public string? Description { get; set; }
        public int LikeCount { get; set; }
        public string? PostedBy { get; set; }
        public DateTime? PostedDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
