using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class UserService(IUserProvider provider, IEmailSender emailSender, IConfiguration config) : IUserService
{
    private const string GenericForgotMessage = "If your email exists in our system, you will receive a password reset link.";
    private const string GenericResendMessage = "If this account is waiting for confirmation, a new code has been sent.";
    private const int CodeValidMinutes = 15;
    private const int CodeResendCooldownSeconds = 60;
    private const int MaxCodeAttempts = 5;

    public async Task<RegistrationResponseDto> RegisterAsync(UserForRegistrationDto registration)
    {
        try
        {
            return await RegisterCoreAsync(registration);
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw new ServerErrorException(ex.Message, new
            {
                status = false,
                message = "Registration error",
                errors = new[] { "An unexpected error occurred. Please try again." }
            });
        }
    }

    private async Task<RegistrationResponseDto> RegisterCoreAsync(UserForRegistrationDto registration)
    {
        if (registration.Password != registration.PasswordConfirm)
            throw Error("Password confirmation does not match", "The passwords you entered do not match. Please try again.");

        var validation = PasswordValidator.Validate(registration.Password);
        if (!validation.IsValid)
            throw new BadRequestException("Weak password", StrengthBody(validation.Errors, validation));

        if (await provider.EmailExistsAsync(registration.User_Email))
            throw EmailTaken();

        if (string.IsNullOrWhiteSpace(registration.User_Email) || !registration.User_Email.Contains('@'))
            throw Error("Invalid email address", "Please provide a valid email address (e.g., name@example.com)");

        var passwordSalt = PasswordHasher.CreateSalt();
        var passwordHash = GetPasswordHash(registration.Password, passwordSalt);

        if (registration.User_IsCompany)
        {
            var companyErrors = new List<string>();
            if (string.IsNullOrEmpty(registration.Company_Name))
                companyErrors.Add("Company name is required");
            if (string.IsNullOrEmpty(registration.Company_Address))
                companyErrors.Add("Company address is required");
            if (string.IsNullOrEmpty(registration.Company_TaxNumber))
                companyErrors.Add("Tax number / VAT ID is required");
            if (string.IsNullOrEmpty(registration.Company_PostCode))
                companyErrors.Add("Post code is required");
            if (string.IsNullOrEmpty(registration.Company_City))
                companyErrors.Add("City is required");
            if (string.IsNullOrEmpty(registration.Company_Country))
                companyErrors.Add("Country is required");

            if (companyErrors.Count > 0)
            {
                throw new BadRequestException("Missing required company information", new
                {
                    status = false,
                    message = "Missing required company information",
                    errors = companyErrors
                });
            }
        }
        else if (string.IsNullOrEmpty(registration.User_FullName))
        {
            throw Error("Full name is required", "Please enter your full name");
        }

        var newUser = registration.User_IsCompany
            ? new NewUser(registration.Company_Name, registration.User_Email, true, passwordHash, passwordSalt,
                registration.User_Phone ?? "", registration.Company_Name, registration.Company_Address,
                registration.Company_TaxNumber, registration.Company_PostCode, registration.Company_City,
                registration.Company_Country, registration.Company_Phone ?? "")
            : new NewUser(registration.User_FullName, registration.User_Email, false, passwordHash, passwordSalt,
                registration.User_Phone ?? "", null, null, null, null, null, null, null);

        var userId = await provider.RegisterAsync(newUser) ?? throw EmailTaken();

        var user = await provider.GetByIdAsync(userId)
            ?? throw new ServerErrorException("Account created but failed to retrieve user data", new
            {
                status = false,
                message = "Account created but failed to retrieve user data",
                errors = new[] { "Please try logging in with your new account." }
            });

        await SendVerificationCodeAsync(user, registration.Language);

        return new RegistrationResponseDto(true, true, user.User_Email,
            "Registration successful! We sent a 6-digit code to your email. Enter it to activate your account.",
            CodeResendCooldownSeconds);
    }

    public async Task<AuthResponseDto> LoginAsync(UserForLoginDto login)
    {
        if (string.IsNullOrWhiteSpace(login.User_Email))
            throw Error("Email address is required", "Please enter your email address");

        if (string.IsNullOrWhiteSpace(login.Password))
            throw Error("Password is required", "Please enter your password");

        var user = await provider.GetByEmailAsync(login.User_Email);
        if (user?.PasswordSalt == null)
            throw InvalidCredentials();

        var passwordHash = GetPasswordHash(login.Password, user.PasswordSalt);
        if (!CryptographicOperations.FixedTimeEquals(passwordHash, user.PasswordHash))
            throw InvalidCredentials();

        if (!user.EmailConfirmed)
        {
            var retryAfter = await SendVerificationCodeIfAllowedAsync(user, login.Language);
            throw new ForbiddenException("Email not confirmed", new
            {
                status = false,
                requiresVerification = true,
                email = user.User_Email,
                retryAfterSeconds = retryAfter,
                message = "Email not confirmed",
                errors = new[] { "Please confirm your email address. We sent you a 6-digit code." }
            });
        }

        return new AuthResponseDto(true, CreateToken(user), "✅ Login successful! Welcome back!", ToAuthUser(user));
    }

    public async Task<AuthResponseDto> VerifyEmailAsync(VerifyEmailDto request)
    {
        var code = EmailVerificationCode.Normalize(request.Code)
            ?? throw Error("Invalid code", "Please enter the 6-digit code from the email.");

        if (string.IsNullOrWhiteSpace(request.User_Email))
            throw Error("Email address is required", "Please enter your email address");

        var user = await provider.GetByEmailAsync(request.User_Email.Trim())
            ?? throw InvalidCode();

        if (user.EmailConfirmed)
            throw Error("Email already confirmed", "Your email is already confirmed. Please sign in.");

        var info = await provider.GetEmailCodeAsync(user.User_Id);
        if (info?.EmailCode_Hash == null || info.EmailCode_ExpiresAt == null)
            throw CodeExpired();

        if (info.EmailCode_Attempts >= MaxCodeAttempts)
            throw TooManyAttempts();

        if (info.EmailCode_ExpiresAt < DateTime.UtcNow)
            throw CodeExpired();

        var attempts = await provider.IncrementEmailCodeAttemptsAsync(user.User_Id);
        if (attempts > MaxCodeAttempts)
            throw TooManyAttempts();

        var candidate = EmailVerificationCode.Hash(user.User_Id, code, TokenKey());
        if (!EmailVerificationCode.Matches(info.EmailCode_Hash, candidate))
        {
            var left = MaxCodeAttempts - attempts;
            if (left <= 0)
                throw TooManyAttempts();

            throw new BadRequestException("Invalid code", new
            {
                status = false,
                message = "Invalid code",
                attemptsLeft = left,
                errors = new[] { $"The code is not correct. You have {left} attempt(s) left." }
            });
        }

        if (!await provider.ConfirmEmailAsync(user.User_Id, candidate, DateTime.UtcNow))
            throw CodeExpired();

        user.EmailConfirmed = true;
        return new AuthResponseDto(true, CreateToken(user), "✅ Email confirmed! Welcome to Proteini.si!", ToAuthUser(user));
    }

    public async Task<ResendVerificationResponseDto> ResendVerificationCodeAsync(ResendVerificationCodeDto request)
    {
        if (string.IsNullOrWhiteSpace(request.User_Email))
            throw Error("Email address is required", "Please enter your email address");

        var user = await provider.GetByEmailAsync(request.User_Email.Trim());
        if (user == null || user.EmailConfirmed)
            return new ResendVerificationResponseDto(true, GenericResendMessage, CodeResendCooldownSeconds);

        var retryAfter = await SendVerificationCodeIfAllowedAsync(user, request.Language);
        return new ResendVerificationResponseDto(true, GenericResendMessage, retryAfter);
    }

    /// <summary>Sends a fresh code unless one went out within the cooldown; returns seconds until the next resend.</summary>
    private async Task<int> SendVerificationCodeIfAllowedAsync(User user, string? language)
    {
        var info = await provider.GetEmailCodeAsync(user.User_Id);
        if (info?.EmailCode_SentAt is { } sentAt)
        {
            var wait = CodeResendCooldownSeconds - (int)(DateTime.UtcNow - sentAt).TotalSeconds;
            if (wait > 0)
                return wait;
        }

        await SendVerificationCodeAsync(user, language);
        return CodeResendCooldownSeconds;
    }

    private async Task SendVerificationCodeAsync(User user, string? language)
    {
        var code = EmailVerificationCode.Generate();
        var now = DateTime.UtcNow;

        await provider.SetEmailCodeAsync(user.User_Id, EmailVerificationCode.Hash(user.User_Id, code, TokenKey()),
            now.AddMinutes(CodeValidMinutes), now);

        var (subject, html) = VerificationEmailTemplate.Build(user.User_FullName, code, CodeValidMinutes, language);
        await emailSender.SendAsync([user.User_Email], subject, html);
    }

    public async Task<StatusMessageDto> ForgotPasswordAsync(ForgotPasswordDto request)
    {
        var userId = await provider.GetIdByEmailAsync(request.User_Email);
        if (userId == 0)
            return new StatusMessageDto(true, GenericForgotMessage);

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim("userId", userId.ToString()),
                new Claim("reset", "true")
            ]),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(ResetTokenKey()), SecurityAlgorithms.HmacSha256Signature)
        };
        var tokenString = tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));

        await provider.SetResetTokenAsync(userId, tokenString, DateTime.UtcNow.AddHours(1));

        await emailSender.SendAsync(
            [request.User_Email],
            "Password Reset Request",
            $"Please reset your password by clicking here: <a href=\"https://proteini.mk/reset-password?token={tokenString}\">Reset Password</a>");

        return new StatusMessageDto(true, GenericForgotMessage);
    }

    public async Task<StatusMessageDto> ResetPasswordAsync(ResetPasswordDto request)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw Error("Passwords don't match", "The passwords you entered do not match. Please try again.");

        var validation = PasswordValidator.Validate(request.NewPassword);
        if (!validation.IsValid)
            throw new BadRequestException("Weak password", StrengthBody($"Password needs {validation.Errors.Count} more requirement(s)", validation));

        var key = ResetTokenKey();

        try
        {
            new JwtSecurityTokenHandler().ValidateToken(request.Token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "userId").Value);

            if (!jwtToken.Claims.Any(x => x.Type == "reset" && x.Value == "true"))
                throw Error("Already used or expired!", "This token is not valid for password reset.");

            var tokenInfo = await provider.GetResetTokenAsync(userId);

            if (tokenInfo?.ResetToken != request.Token)
                throw Error("Already used or expired!", "This reset link is invalid. Please request a new one.");

            if (tokenInfo.IsResetTokenUsed)
                throw TokenAlreadyUsed();

            if (tokenInfo.ResetTokenExpiration < DateTime.UtcNow)
                throw Error("Token expired", "Your password reset link has expired. Please request a new one.");

            var passwordSalt = PasswordHasher.CreateSalt();
            var passwordHash = GetPasswordHash(request.NewPassword!, passwordSalt);

            if (!await provider.ResetPasswordAsync(userId, request.Token!, passwordHash, passwordSalt))
                throw TokenAlreadyUsed();

            return new StatusMessageDto(true, "✅ Password has been reset successfully! You can now login with your new password.");
        }
        catch (SecurityTokenExpiredException)
        {
            throw Error("Token has expired", "Your password reset link has expired. Please request a new one.");
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw Error("Invalid token", "Unable to reset password. Please request a new reset link.");
        }
    }

    public async Task<UserProfileDto> GetCurrentAsync(int userId)
    {
        var user = await provider.GetByIdAsync(userId)
            ?? throw new NotFoundException("User not found", new { message = "User not found" });

        return ToProfile(user);
    }

    public async Task<BillingUpdateResponseDto> UpdateBillingInfoAsync(int userId, UserForUpdateDto info)
    {
        try
        {
            var rowsAffected = await provider.UpdateBillingInfoAsync(userId, info);

            if (rowsAffected < 0)
                throw new NotFoundException("User not found", new { message = "User not found" });

            if (rowsAffected == 0)
                throw new ServerErrorException("Failed to update billing information", new { message = "Failed to update billing information" });

            var updatedUser = await provider.GetByIdAsync(userId)
                ?? throw new InvalidOperationException("Updated user could not be loaded.");

            return new BillingUpdateResponseDto(true, "Billing information updated successfully", ToProfile(updatedUser));
        }
        catch (Exception ex) when (ex is not AppException)
        {
            throw new ServerErrorException(ex.Message, new { message = "Update failed" });
        }
    }

    private static object StrengthBody(object message, PasswordValidationResult validation) => new
    {
        status = false,
        message,
        errors = validation.Errors,
        strength = new
        {
            percent = validation.MetRequirements.StrengthPercent,
            description = PasswordValidator.GetStrengthDescription(validation.MetRequirements.StrengthPercent),
            metRequirements = new
            {
                minLength = validation.MetRequirements.MinLength,
                uppercase = validation.MetRequirements.Uppercase,
                lowercase = validation.MetRequirements.Lowercase,
                digit = validation.MetRequirements.Digit,
                specialChar = validation.MetRequirements.SpecialChar,
                metCount = validation.MetRequirements.MetCount,
                totalRequired = validation.MetRequirements.TotalRequired
            }
        }
    };

    private static AuthUserDto ToAuthUser(User user) =>
        new(user.User_Id, user.User_FullName, user.User_Email, user.User_IsCompany, user.SuperAdmin, user.User_Phone, ToCompany(user));

    private static UserProfileDto ToProfile(User user) =>
        new(user.User_Id, user.User_FullName, user.User_Email, user.User_IsCompany, user.SuperAdmin, user.User_Phone,
            user.User_Address, user.User_PostCode, user.User_City, user.User_Country, ToCompany(user));

    private static UserCompanyDto? ToCompany(User user) =>
        user.User_IsCompany
            ? new UserCompanyDto(user.Company_Name, user.Company_Address, user.Company_TaxNumber, user.Company_PostCode,
                user.Company_City, user.Company_Country, user.Company_Phone, user.Company_CreatedAt)
            : null;

    private byte[] GetPasswordHash(string password, byte[] passwordSalt) =>
        PasswordHasher.Hash(password, passwordSalt, config["AppSettings:PasswordKey"]);

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new("userId", user.User_Id.ToString()),
            new("fullName", user.User_FullName ?? string.Empty),
            new("email", user.User_Email ?? string.Empty),
            new("isCompany", user.User_IsCompany.ToString()),
            new("superAdmin", user.SuperAdmin.ToString())
        };

        var tokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TokenKey()));
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            SigningCredentials = new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha512Signature),
            Expires = DateTime.Now.AddDays(1)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
    }

    private string TokenKey() =>
        config["AppSettings:TokenKey"] ?? throw new InvalidOperationException("AppSettings:TokenKey is not configured.");

    private byte[] ResetTokenKey() => Encoding.ASCII.GetBytes(TokenKey());

    private static BadRequestException Error(string message, string error) =>
        new(message, new { status = false, message, errors = new[] { error } });

    private static ConflictException EmailTaken() =>
        new("Email already registered", new
        {
            status = false,
            message = "Email already registered",
            errors = new[] { "This email address is already in use. Please use a different email or login instead." }
        });

    private static UnauthorizedException InvalidCredentials() =>
        new("Invalid email or password", new
        {
            status = false,
            message = "Invalid email or password",
            errors = new[] { "The email address or password you entered is incorrect. Please try again." }
        });

    private static BadRequestException InvalidCode() =>
        Error("Invalid code", "The code is not correct. Please check the email and try again.");

    private static BadRequestException CodeExpired() =>
        new("Code expired", new
        {
            status = false,
            message = "Code expired",
            codeExpired = true,
            errors = new[] { "This code has expired. Please request a new one." }
        });

    private static BadRequestException TooManyAttempts() =>
        new("Too many attempts", new
        {
            status = false,
            message = "Too many attempts",
            codeExpired = true,
            errors = new[] { "Too many incorrect attempts. Please request a new code." }
        });

    private static BadRequestException TokenAlreadyUsed() =>
        Error("Token already used", "This password reset link has already been used. Please request a new one if you need to reset your password again.");
}
