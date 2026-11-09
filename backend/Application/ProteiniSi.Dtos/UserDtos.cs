namespace ProteiniSi.Dtos;

public class UserForRegistrationDto
{
    public string? User_FullName { get; set; } = string.Empty;
    public string User_Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PasswordConfirm { get; set; } = string.Empty;
    public bool User_IsCompany { get; set; }
    public string? User_Phone { get; set; }
    public string? Company_Name { get; set; }
    public string? Company_Address { get; set; }
    public string? Company_TaxNumber { get; set; }
    public string? Company_PostCode { get; set; }
    public string? Company_City { get; set; }
    public string? Company_Country { get; set; }
    public string? Company_Phone { get; set; }
    public string? Language { get; set; }
}

public class UserForLoginDto
{
    public string? User_Email { get; set; }
    public string? Password { get; set; }
    public string? Language { get; set; }
}

public class VerifyEmailDto
{
    public string? User_Email { get; set; }
    public string? Code { get; set; }
}

public class ResendVerificationCodeDto
{
    public string? User_Email { get; set; }
    public string? Language { get; set; }
}

public class ForgotPasswordDto
{
    public string? User_Email { get; set; }
}

public class ResetPasswordDto
{
    public string? Token { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
}

public class UserForUpdateDto
{
    public string? User_Address { get; set; }
    public string? User_PostCode { get; set; }
    public string? User_City { get; set; }
    public string? User_Country { get; set; }
    public string? User_Phone { get; set; }
    public string? Company_Name { get; set; }
    public string? Company_Address { get; set; }
    public string? Company_TaxNumber { get; set; }
    public string? Company_PostCode { get; set; }
    public string? Company_City { get; set; }
    public string? Company_Country { get; set; }
    public string? Company_Phone { get; set; }
}

public record UserCompanyDto(
    string? Company_Name,
    string? Company_Address,
    string? Company_TaxNumber,
    string? Company_PostCode,
    string? Company_City,
    string? Company_Country,
    string? Company_Phone,
    DateTime? Company_CreatedAt);

public record AuthUserDto(
    int User_Id,
    string User_FullName,
    string User_Email,
    bool User_IsCompany,
    bool SuperAdmin,
    string? User_Phone,
    UserCompanyDto? Company);

public record AuthResponseDto(bool Status, string Token, string Message, AuthUserDto User);

public record UserProfileDto(
    int User_Id,
    string User_FullName,
    string User_Email,
    bool User_IsCompany,
    bool SuperAdmin,
    string? User_Phone,
    string? User_Address,
    string? User_PostCode,
    string? User_City,
    string? User_Country,
    UserCompanyDto? Company);

public record BillingUpdateResponseDto(bool Status, string Message, UserProfileDto User);

public record StatusMessageDto(bool Status, string Message);

public record RegistrationResponseDto(bool Status, bool RequiresVerification, string Email, string Message, int RetryAfterSeconds);

public record ResendVerificationResponseDto(bool Status, string Message, int RetryAfterSeconds);
