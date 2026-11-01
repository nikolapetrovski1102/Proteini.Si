// UserForUpdateDto.cs
namespace ProteinisiBackend.Models.DTOs
{
    public class UserForUpdateDto
    {
        // Natural person billing fields
        public string? User_Address { get; set; }
        public string? User_PostCode { get; set; }
        public string? User_City { get; set; }
        public string? User_Country { get; set; }
        public string? User_Phone { get; set; }

        // Company fields (for editing existing company info)
        public string? Company_Name { get; set; }
        public string? Company_Address { get; set; }
        public string? Company_TaxNumber { get; set; }
        public string? Company_PostCode { get; set; }
        public string? Company_City { get; set; }
        public string? Company_Country { get; set; }
        public string? Company_Phone { get; set; }
    }
}