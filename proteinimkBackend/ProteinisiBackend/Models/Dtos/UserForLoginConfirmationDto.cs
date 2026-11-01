namespace ProteinisiBackend.Models.DTOs
{
    public class UserForLoginConfirmationDto
    {
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public int Visibility { get; set; }
    }
}
