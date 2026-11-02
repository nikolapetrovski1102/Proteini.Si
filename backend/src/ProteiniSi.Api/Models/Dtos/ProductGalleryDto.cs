using Newtonsoft.Json;

namespace ProteiniSi.Api.Models.DTOs
{
    public class ProductGalleryDto
    {
        public int Gallery_Id { get; set; }
        public int Product_Id { get; set; }
        public string Image_Path { get; set; } = string.Empty;
        public int Display_Order { get; set; }
        public bool IsActive { get; set; }
        public DateTime? Created_At { get; set; }
    }

    public class UploadGalleryImageDto
    {
        public int Product_Id { get; set; }
        public IFormFile Image { get; set; }
        public int? Display_Order { get; set; }
    }

    public class ReorderGalleryImageDto
    {
        public int Gallery_Id { get; set; }
        public int NewDisplayOrder { get; set; }
    }

    public class SetMainImageDto
    {
        public int Product_Id { get; set; }
        public int Gallery_Id { get; set; }
    }
}