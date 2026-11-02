namespace ProteiniSi.Api.Models.Dtos
{
    // For CREATE - admin will upload image
    public class CreatePartnerDto
    {
        public string Type { get; set; } // 'partner' or 'award'
        public string Name { get; set; }
        public IFormFile Image { get; set; }
        public string? Url { get; set; }
        public int DisplayOrder { get; set; }
        public string? CreatedBy { get; set; }
    }

    // For UPDATE
    public class UpdatePartnerDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public IFormFile? Image { get; set; }
        public string? Url { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public string? UpdatedBy { get; set; }
    }

    // For RESPONSE (when returning data to frontend)
    public class PartnerResponseDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public string ImagePath { get; set; }
        public string? Url { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // For reordering
    public class ReorderPartnerDto
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }
    }
}