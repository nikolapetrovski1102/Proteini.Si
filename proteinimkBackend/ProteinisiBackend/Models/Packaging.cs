using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProteinisiBackend.Models
{
    [Table("Packaging")]
    public class Packaging
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Packaging_Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Packaging_Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Packaging_Type { get; set; }

        public decimal? Weight_Grams { get; set; }

        public int? Quantity_Per_Box { get; set; }

        public int Display_Order { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime? Created_At { get; set; } = DateTime.Now;
    }
}