using System.ComponentModel.DataAnnotations;

namespace ProteiniSi.Api.Models.DTOs
{
    public class UserForRegistrationDto
    {
        public string? User_FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string User_Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string PasswordConfirm { get; set; } = string.Empty;

        public bool User_IsCompany { get; set; } = false;
        public string? User_Phone { get; set; }
        public string? Company_Name { get; set; }
        public string? Company_Address { get; set; }
        public string? Company_TaxNumber { get; set; }
        public string? Company_PostCode { get; set; }
        public string? Company_City { get; set; }
        public string? Company_Country { get; set; }
        public string? Company_Phone { get; set; }
    }
}