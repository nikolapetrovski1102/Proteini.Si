using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ProteinisiBackend.Models
{
    [Table("ProductGallery")]
    public class ProductGallery
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Gallery_Id { get; set; }

        [Required]
        public int Product_Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Image_Path { get; set; } = string.Empty;

        public int Display_Order { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime? Created_At { get; set; } = DateTime.Now;

        // Navigation property (optional, for joins)
        [ForeignKey("Product_Id")]
        [JsonIgnore]
        public virtual Product? Product { get; set; }
    }
}