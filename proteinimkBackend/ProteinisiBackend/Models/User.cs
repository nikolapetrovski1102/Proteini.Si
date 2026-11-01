using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProteinisiBackend.Models
{
    [Table("User")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int User_Id { get; set; }

        [Required]
        [MaxLength(45)]
        public string User_FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(45)]
        public string User_Email { get; set; } = string.Empty;

        public bool User_IsCompany { get; set; } = false;

        // Password fields
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }

        // Reset token fields
        [MaxLength(255)]
        public string ResetToken { get; set; }

        public DateTime? ResetTokenExpiration { get; set; }

        public bool SuperAdmin { get; set; } = false;
        public string? Company_Name { get; set; }
        public string? Company_Address { get; set; }
        public string? Company_TaxNumber { get; set; }
        public string? Company_PostCode { get; set; }
        public string? Company_City { get; set; }
        public string? Company_Country { get; set; }
        public string? Company_Phone { get; set; }
        public DateTime? Company_CreatedAt { get; set; }
        public string? User_Phone { get; set; }
        public string? User_Address { get; set; }
        public string? User_City { get; set; }
        public string? User_PostCode { get; set; }
        public string? User_Country { get; set; }

    }
}