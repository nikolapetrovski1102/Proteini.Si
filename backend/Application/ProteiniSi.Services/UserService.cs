using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class UserService(
    IUserProvider provider,
    IEmailSender emailSender,
    IConfiguration config,
    IMemoryCache cache,
    IEnumerable<IExternalIdentityVerifier> verifiers,
    IAddressLookupService? addressLookup = null) : IUserService
{
    private const string GenericForgotMessage = "If your email exists in our system, you will receive a password reset link.";
    private const string GenericResendMessage = "If this account is waiting for confirmation, a new code has been sent.";
    private const int CodeValidMinutes = 15;
    private const int CodeResendCooldownSeconds = 60;
    private const int MaxCodeAttempts = 5;
    private const int MaxSignInCodesPerHour = 5;

    // dbo.[User].User_Email and User_FullName are NVARCHAR(45).
    private const int MaxEmailLength = 45;
    private const int MaxNameLength = 45;

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

        var (emailValid, normalizedEmail, emailError, _) = CheckoutFieldValidator.ValidateEmail(registration.User_Email, MaxEmailLength);
        if (!emailValid)
            throw Error("Invalid email address", emailError!);

        var domainError = await CheckoutFieldValidator.ValidateEmailDomainAsync(normalizedEmail!);
        if (domainError != null)
            throw Error("Invalid email address", domainError);

        registration.User_Email = normalizedEmail!;

        if (await provider.EmailExistsAsync(registration.User_Email))
            throw EmailTaken();

        var options = addressLookup != null ? await addressLookup.GetCheckoutOptionsAsync() : null;
        var phoneCountries = options?.PhoneCountries ?? CheckoutFieldValidator.DefaultCountries;
        var shippingCountries = options?.ShippingCountries ?? CheckoutFieldValidator.DefaultCountries;
        var cities = options?.Cities;

        string normalizedUserPhone = "";
        if (!string.IsNullOrWhiteSpace(registration.User_Phone))
        {
            normalizedUserPhone = CheckoutFieldValidator.NormalizePhone(registration.User_Phone, phoneCountries)
                ?? throw Error("Invalid phone number", "Please enter a valid phone number for an allowed country (e.g. +389 71 000 000).");
        }

        var passwordSalt = PasswordHasher.CreateSalt();
        var passwordHash = GetPasswordHash(registration.Password, passwordSalt);

        string? normalizedCompanyPhone = null;
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

            if (companyErrors.Count == 0)
            {
                var canonicalCountry = CheckoutFieldValidator.NormalizeShippingCountry(registration.Company_Country, shippingCountries);
                if (canonicalCountry == null)
                    companyErrors.Add("Country must be North Macedonia");
                else
                    registration.Company_Country = canonicalCountry;

                var (cityValid, canonicalCity, canonicalPostCode, cityError) =
                    CheckoutFieldValidator.ValidateCityAndPostCode(registration.Company_City, registration.Company_PostCode, cities);
                if (!cityValid)
                {
                    companyErrors.Add(cityError!);
                }
                else
                {
                    registration.Company_City = canonicalCity;
                    registration.Company_PostCode = canonicalPostCode;
                }

                if (!string.IsNullOrWhiteSpace(registration.Company_Phone))
                {
                    normalizedCompanyPhone = CheckoutFieldValidator.NormalizePhone(registration.Company_Phone, phoneCountries);
                    if (normalizedCompanyPhone == null)
                        companyErrors.Add("Please enter a valid company phone number (e.g. +389 71 000 000)");
                }
            }

            if (companyErrors.Count > 0)
            {
                throw new BadRequestException("Missing or invalid company information", new
                {
                    status = false,
                    message = "Missing or invalid company information",
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
                normalizedUserPhone, registration.Company_Name, registration.Company_Address,
                registration.Company_TaxNumber, registration.Company_PostCode, registration.Company_City,
                registration.Company_Country, normalizedCompanyPhone ?? "")
            : new NewUser(registration.User_FullName, registration.User_Email, false, passwordHash, passwordSalt,
                normalizedUserPhone, null, null, null, null, null, null, null);

        var userId = await provider.RegisterAsync(newUser) ?? throw EmailTaken();

        var user = await provider.GetByIdAsync(userId)
            ?? throw new ServerErrorException("Account created but failed to retrieve user data", new
            {
                status = false,
                message = "Account created but failed to retrieve user data",
                errors = new[] { "Please try logging in with your new account." }
            });

        await RememberLanguageAsync(userId, registration.Language);
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

        await RememberLanguageAsync(user.User_Id, login.Language);
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

    /* ----------------------------------------------------------- Google */

    public async Task<AuthResponseDto> ExternalSignInAsync(ExternalSignInDto request)
    {
        var verifier = verifiers.FirstOrDefault(v =>
            string.Equals(v.Provider, request.Provider?.Trim(), StringComparison.OrdinalIgnoreCase));
        if (verifier is not { IsConfigured: true })
            throw Error("Sign-in method not available", "This sign-in method is not available. Please use another one.");

        if (string.IsNullOrWhiteSpace(request.Token))
            throw Error("Missing token", "Sign-in was cancelled. Please try again.");

        var identity = await verifier.VerifyAsync(request.Token.Trim())
            ?? throw new UnauthorizedException("External sign-in failed", new
            {
                status = false,
                message = "External sign-in failed",
                errors = new[] { "We could not confirm your sign-in. Please try again." }
            });

        // Only an address the provider verified may attach to an existing account.
        var email = NormalizeEmail(identity.Email);
        if (email != null && !identity.EmailVerified)
            email = null;

        var name = CleanName(identity.Name) ?? CleanName(email?.Split('@')[0]);
        var result = await provider.SignInExternalAsync(identity.Provider, identity.ProviderKey, email, name, identity.EmailVerified);

        switch (result.Outcome)
        {
            case ExternalSignInOutcome.EmailRequired:
                throw new BadRequestException("Email required", new
                {
                    status = false,
                    message = "Email required",
                    emailRequired = true,
                    errors = new[] { "We did not receive a usable email address from this account. Please sign in with an email code instead." }
                });
            case ExternalSignInOutcome.LinkNotAllowed:
                throw new ConflictException("Account already exists", new
                {
                    status = false,
                    message = "Account already exists",
                    accountExists = true,
                    email,
                    errors = new[] { "An account with this email already exists. Please sign in with your password or an email code." }
                });
        }

        return await SignedInAsync(result, "✅ Login successful! Welcome!", request.Language);
    }

    /* --------------------------------------------- passwordless email code */

    private sealed class PendingSignInCode
    {
        public required byte[] Hash { get; init; }
        public required DateTime ExpiresAt { get; init; }
        public required DateTime SentAt { get; init; }
        public int Attempts;
    }

    private sealed class SendCounter
    {
        public int Count;
    }

    public async Task<EmailCodeSentDto> SendSignInCodeAsync(EmailCodeSendDto request)
    {
        var email = NormalizeEmail(request.User_Email)
            ?? throw Error("Invalid email address", "Please provide a valid email address (e.g., name@example.com)");

        var isNew = !await provider.EmailExistsAsync(email);
        const string sent = "We sent a 6-digit code to your email.";

        var now = DateTime.UtcNow;
        if (cache.TryGetValue(SignInCodeKey(email), out PendingSignInCode? existing) && existing != null)
        {
            var wait = CodeResendCooldownSeconds - (int)(now - existing.SentAt).TotalSeconds;
            if (wait > 0)
                return new EmailCodeSentDto(true, sent, wait, isNew);
        }

        var counter = cache.GetOrCreate($"signin-code-sends:{email}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return new SendCounter();
        })!;
        if (Interlocked.Increment(ref counter.Count) > MaxSignInCodesPerHour)
            throw Error("Too many codes requested", "Too many codes were requested for this email. Please try again in an hour.");

        var code = EmailVerificationCode.Generate();
        cache.Set(SignInCodeKey(email), new PendingSignInCode
        {
            Hash = SignInCodeHash(email, code),
            ExpiresAt = now.AddMinutes(CodeValidMinutes),
            SentAt = now
        }, TimeSpan.FromMinutes(CodeValidMinutes));

        var (subject, html) = VerificationEmailTemplate.BuildSignIn(code, CodeValidMinutes, request.Language);
        await emailSender.SendAsync([email], subject, html);

        return new EmailCodeSentDto(true, sent, CodeResendCooldownSeconds, isNew);
    }

    public async Task<AuthResponseDto> SignInWithEmailCodeAsync(EmailCodeSignInDto request)
    {
        var email = NormalizeEmail(request.User_Email)
            ?? throw Error("Invalid email address", "Please provide a valid email address (e.g., name@example.com)");
        var code = EmailVerificationCode.Normalize(request.Code)
            ?? throw Error("Invalid code", "Please enter the 6-digit code from the email.");

        var name = CleanName(request.User_FullName);
        if (name == null && !await provider.EmailExistsAsync(email))
            throw new BadRequestException("Full name is required", new
            {
                status = false,
                message = "Full name is required",
                requiresName = true,
                errors = new[] { "Please enter your full name" }
            });

        if (!cache.TryGetValue(SignInCodeKey(email), out PendingSignInCode? pending) || pending == null || pending.ExpiresAt < DateTime.UtcNow)
            throw CodeExpired();

        var attempts = Interlocked.Increment(ref pending.Attempts);
        if (attempts > MaxCodeAttempts)
        {
            cache.Remove(SignInCodeKey(email));
            throw TooManyAttempts();
        }

        if (!EmailVerificationCode.Matches(pending.Hash, SignInCodeHash(email, code)))
        {
            var left = MaxCodeAttempts - attempts;
            if (left <= 0)
            {
                cache.Remove(SignInCodeKey(email));
                throw TooManyAttempts();
            }

            throw new BadRequestException("Invalid code", new
            {
                status = false,
                message = "Invalid code",
                attemptsLeft = left,
                errors = new[] { $"The code is not correct. You have {left} attempt(s) left." }
            });
        }

        cache.Remove(SignInCodeKey(email));

        var result = await provider.SignInExternalAsync(null, null, email, name, allowLink: true);
        return await SignedInAsync(result, "✅ Login successful! Welcome!", request.Language);
    }

    private async Task<AuthResponseDto> SignedInAsync(ExternalSignInResult result, string message, string? language = null)
    {
        var user = (result.UserId is { } id ? await provider.GetByIdAsync(id) : null)
            ?? throw new InvalidOperationException($"Sign-in resolved to no user (outcome {result.Outcome}).");
        await RememberLanguageAsync(user.User_Id, language);

        return new AuthResponseDto(true, CreateToken(user), message, ToAuthUser(user),
            result.Outcome == ExternalSignInOutcome.Created);
    }

    /// <summary>Stores the site language the customer uses, so later emails (marketing) match it. Never blocks sign-in.</summary>
    private async Task RememberLanguageAsync(int userId, string? language)
    {
        if (EmailLanguage.OrNull(language) is not { } lang) return;
        try { await provider.SetLanguageAsync(userId, lang); }
        catch { /* the column may not exist yet during a deployment */ }
    }

    private static string SignInCodeKey(string email) => $"signin-code:{email}";

    private byte[] SignInCodeHash(string email, string code) =>
        HMACSHA256.HashData(Encoding.UTF8.GetBytes(TokenKey()), Encoding.UTF8.GetBytes($"signin-code:{email}:{code}"));

    /// <summary>Trimmed, lower-cased address, or null when it is not a plausible email or does not fit the column.</summary>
    private static string? NormalizeEmail(string? email)
    {
        var value = email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(value) || value.Length > MaxEmailLength)
            return null;

        var at = value.IndexOf('@');
        return at > 0 && at == value.LastIndexOf('@') && value.IndexOf('.', at) > at + 1 && !value.EndsWith('.') && !value.Any(char.IsWhiteSpace)
            ? value
            : null;
    }

    private static string? CleanName(string? name)
    {
        var value = string.Join(' ', (name ?? "").Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
        if (value.Length == 0)
            return null;

        return value.Length <= MaxNameLength ? value : value[..MaxNameLength].TrimEnd();
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

        var (subject, html) = VerificationEmailTemplate.BuildPasswordReset(
            $"{EmailLayout.SiteUrl}/reset-password?token={Uri.EscapeDataString(tokenString)}", request.Language);
        await emailSender.SendAsync([request.User_Email], subject, html);

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
            var options = addressLookup != null ? await addressLookup.GetCheckoutOptionsAsync() : null;
            var phoneCountries = options?.PhoneCountries ?? CheckoutFieldValidator.DefaultCountries;
            var shippingCountries = options?.ShippingCountries ?? CheckoutFieldValidator.DefaultCountries;
            var cities = options?.Cities;

            if (!string.IsNullOrWhiteSpace(info.User_Phone))
            {
                info.User_Phone = CheckoutFieldValidator.NormalizePhone(info.User_Phone, phoneCountries)
                    ?? throw Error("Invalid phone number", "Please enter a valid phone number for an allowed country (e.g. +389 71 000 000).");
            }

            if (!string.IsNullOrWhiteSpace(info.User_Country))
            {
                info.User_Country = CheckoutFieldValidator.NormalizeShippingCountry(info.User_Country, shippingCountries)
                    ?? throw Error("Invalid country", "Shipping is only available in North Macedonia.");
            }

            if (!string.IsNullOrWhiteSpace(info.User_City) || !string.IsNullOrWhiteSpace(info.User_PostCode))
            {
                var (cityValid, canonicalCity, canonicalPostCode, cityError) =
                    CheckoutFieldValidator.ValidateCityAndPostCode(info.User_City, info.User_PostCode, cities);
                if (!cityValid)
                    throw Error("Invalid city or post code", cityError!);

                info.User_City = canonicalCity;
                info.User_PostCode = canonicalPostCode;
            }

            if (!string.IsNullOrWhiteSpace(info.Company_Phone))
            {
                info.Company_Phone = CheckoutFieldValidator.NormalizePhone(info.Company_Phone, phoneCountries)
                    ?? throw Error("Invalid company phone number", "Please enter a valid company phone number (e.g. +389 71 000 000).");
            }

            if (!string.IsNullOrWhiteSpace(info.Company_Country))
            {
                info.Company_Country = CheckoutFieldValidator.NormalizeShippingCountry(info.Company_Country, shippingCountries)
                    ?? throw Error("Invalid company country", "Country must be North Macedonia.");
            }

            if (!string.IsNullOrWhiteSpace(info.Company_City) || !string.IsNullOrWhiteSpace(info.Company_PostCode))
            {
                var (cCityValid, cCanonicalCity, cCanonicalPostCode, cCityError) =
                    CheckoutFieldValidator.ValidateCityAndPostCode(info.Company_City, info.Company_PostCode, cities);
                if (!cCityValid)
                    throw Error("Invalid company city or post code", cCityError!);

                info.Company_City = cCanonicalCity;
                info.Company_PostCode = cCanonicalPostCode;
            }

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
