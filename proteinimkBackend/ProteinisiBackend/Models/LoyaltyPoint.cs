using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProteinisiBackend.Models
{
    [Table("LoyaltyPoints")]
    public class LoyaltyPoint
    {
        [Key]
        public int LoyaltyPointId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public decimal Points { get; set; }

        [Required]
        [MaxLength(50)]
        public string PointsType { get; set; } // 'earned', 'redeemed', 'expired', 'adjusted'

        [Required]
        [MaxLength(50)]
        public string SourceType { get; set; } // 'order', 'bonus', 'refund', 'promotion'

        public int? SourceId { get; set; } // Order_Id or other reference ID

        [MaxLength(500)]
        public string Description { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        public DateTime? ExpiryDate { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}