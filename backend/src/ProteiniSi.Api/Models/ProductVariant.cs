using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProteiniSi.Api.Models
{
    [Table("ProductVariants")]
    public class ProductVariant
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Variant_Id { get; set; }

        [Required]
        public int Product_Id { get; set; }

        [MaxLength(100)]
        public string? SKU { get; set; }

        public int? Flavor_Id { get; set; }

        public int? Packaging_Id { get; set; }

        [Required]
        public decimal Price { get; set; }

        public decimal? Compare_Price { get; set; }

        public decimal? Cost { get; set; }

        public int Quantity { get; set; } = 0;

        public int Low_Stock_Threshold { get; set; } = 5;

        [MaxLength(255)]
        public string? Variant_Name { get; set; }

        [MaxLength(20)]
        public string Option_Type { get; set; } = "flavor";

        [MaxLength(500)]
        public string? Image_Path { get; set; }

        [MaxLength(500)]
        public string? Variant_Image_Path { get; set; }  // ADD THIS - for variant-specific images

        public string? Ingredients { get; set; }

        public string? Nutrition_Info { get; set; }

        public string? Description { get; set; }

        public int Display_Order { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public bool IsDefault { get; set; } = false;

        public DateTime? Created_At { get; set; } = DateTime.Now;

        public DateTime? Updated_At { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("Product_Id")]
        [JsonIgnore]
        public virtual Product? Product { get; set; }

        [ForeignKey("Flavor_Id")]
        public virtual Flavor? Flavor { get; set; }

        [ForeignKey("Packaging_Id")]
        public virtual Packaging? Packaging { get; set; }
        public decimal? LoyaltyPercentage { get; set; }

        // Add to your ProductVariant class
        public virtual ICollection<VariantNutritionColumn> NutritionColumns { get; set; }
        public virtual ICollection<VariantNutritionRow> NutritionRows { get; set; }

    }
}
