namespace ProteinisiBackend.Models
{
    public class Partner
    {
        public int Id { get; set; }
        public string Type { get; set; } // 'partner' or 'award'
        public string Name { get; set; }
        public string ImagePath { get; set; }
        public byte[]? ImageData { get; set; }
        public string? Url { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}