namespace ProteiniSi.Api.Models.Dtos
{
    // For CREATE
    public class CreateAboutCompanySectionDto
    {
        public string SectionType { get; set; } // 'video', 'title', 'paragraph', 'subtitle', 'award', 'business-cooperation'
        public string? Title { get; set; }
        public string? VideoUrl { get; set; }
        public IFormFile? VideoThumbnail { get; set; } // For video thumbnails and business cooperation images
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public string? CreatedBy { get; set; }
    }

    // For UPDATE
    public class UpdateAboutCompanySectionDto
    {
        public int Id { get; set; }
        public string SectionType { get; set; }
        public string? Title { get; set; }
        public string? VideoUrl { get; set; }
        public IFormFile? VideoThumbnail { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string? UpdatedBy { get; set; }
    }

    // For RESPONSE
    public class AboutCompanySectionResponseDto
    {
        public int Id { get; set; }
        public string SectionType { get; set; }
        public string? Title { get; set; }
        public string? VideoUrl { get; set; }
        public string? VideoThumbnailPath { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // For reordering sections
    public class ReorderAboutCompanySectionDto
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }
    }
}
