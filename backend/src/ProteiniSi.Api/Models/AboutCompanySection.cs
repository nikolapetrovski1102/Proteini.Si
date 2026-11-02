namespace ProteiniSi.Api.Models
{
    public class AboutCompanySection
    {
        public int Id { get; set; }
        public string SectionType { get; set; } // 'video', 'title', 'paragraph', 'subtitle', 'award', 'business-cooperation'
        public string? Title { get; set; }
        public string? VideoUrl { get; set; }
        public string? VideoThumbnailPath { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
