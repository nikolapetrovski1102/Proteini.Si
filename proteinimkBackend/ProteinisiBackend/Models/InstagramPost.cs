namespace ProteinisiBackend.Models
{
    public class InstagramPost
    {
        public int Id { get; set; }
        public string PostUrl { get; set; }
        public string ImagePath { get; set; }
        public string? Description { get; set; }
        public int LikeCount { get; set; }
        public string? PostedBy { get; set; }
        public DateTime? PostedDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
