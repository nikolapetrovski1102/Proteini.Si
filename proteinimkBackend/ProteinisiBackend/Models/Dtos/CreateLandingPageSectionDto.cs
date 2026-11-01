namespace ProteinisiBackend.Models.Dtos
{
    // For CREATE
    public class CreateLandingPageSectionDto
    {
        public string SectionType { get; set; } // 'image', 'title', 'subtitle', 'paragraph', 'highlight', 'italic'
        public string? Title { get; set; }
        public IFormFile? Image { get; set; } // For image upload
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public string? CreatedBy { get; set; }
    }

    // For UPDATE
    public class UpdateLandingPageSectionDto
    {
        public int Id { get; set; }
        public string SectionType { get; set; }
        public string? Title { get; set; }
        public IFormFile? Image { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string? UpdatedBy { get; set; }
    }

    // For RESPONSE
    public class LandingPageSectionResponseDto
    {
        public int Id { get; set; }
        public string SectionType { get; set; }
        public string? Title { get; set; }
        public string? ImagePath { get; set; }
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // For reordering sections
    public class ReorderLandingPageSectionDto
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }
    }
}