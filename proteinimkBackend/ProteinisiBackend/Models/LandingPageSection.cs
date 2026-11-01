namespace ProteinisiBackend.Models
{
    public class LandingPageSection
    {
        public int Id { get; set; }
        public string SectionType { get; set; } // 'image', 'title', 'subtitle', 'paragraph', 'highlight', 'italic'
        public string? Title { get; set; }
        public string? ImagePath { get; set; }
        public byte[]? ImageData { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}