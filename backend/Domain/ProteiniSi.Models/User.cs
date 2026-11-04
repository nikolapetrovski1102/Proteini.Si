namespace ProteiniSi.Models;

public class User
{
    public int User_Id { get; set; }
    public string User_FullName { get; set; } = string.Empty;
    public string User_Email { get; set; } = string.Empty;
    public bool User_IsCompany { get; set; }
    public byte[]? PasswordHash { get; set; }
    public byte[]? PasswordSalt { get; set; }
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiration { get; set; }
    public bool SuperAdmin { get; set; }
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

public class ResetTokenInfo
{
    public string? ResetToken { get; init; }
    public DateTime? ResetTokenExpiration { get; init; }
    public bool IsResetTokenUsed { get; init; }
}

public record NewUser(
    string? User_FullName,
    string User_Email,
    bool User_IsCompany,
    byte[] PasswordHash,
    byte[] PasswordSalt,
    string User_Phone,
    string? Company_Name,
    string? Company_Address,
    string? Company_TaxNumber,
    string? Company_PostCode,
    string? Company_City,
    string? Company_Country,
    string? Company_Phone);
