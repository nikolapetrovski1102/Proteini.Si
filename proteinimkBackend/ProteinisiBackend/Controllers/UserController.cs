using System.Security.Cryptography;
using System.Text;
using ProteinisiBackend.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using ProteinisiBackend.Database;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using ProteinisiBackend.Models.DTOs;
using ProteinisiBackend.Helpers;

namespace ProteinisiBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        DataContextDapper _dapper;
        IConfiguration _config;
        public UserController(IConfiguration config, IHttpContextAccessor httpContextAccessor)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
            _httpContextAccessor = httpContextAccessor;
        }

        [AllowAnonymous]
        [HttpPost("Register")]
        public IActionResult Register([FromBody] UserForRegistrationDto userForRegistration)
        {
            try
            {
                // === ENHANCED VALIDATION ===

                // 1. Check if passwords match
                if (userForRegistration.Password != userForRegistration.PasswordConfirm)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Password confirmation does not match",
                        errors = new[] { "The passwords you entered do not match. Please try again." }
                    });
                }

                // 2. Validate password strength
                var passwordValidation = PasswordValidator.Validate(userForRegistration.Password);
                if (!passwordValidation.IsValid)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = passwordValidation.Errors,
                        errors = passwordValidation.Errors,
                        strength = new
                        {
                            percent = passwordValidation.MetRequirements.StrengthPercent,
                            description = PasswordValidator.GetStrengthDescription(passwordValidation.MetRequirements.StrengthPercent),
                            metRequirements = new
                            {
                                minLength = passwordValidation.MetRequirements.MinLength,
                                uppercase = passwordValidation.MetRequirements.Uppercase,
                                lowercase = passwordValidation.MetRequirements.Lowercase,
                                digit = passwordValidation.MetRequirements.Digit,
                                specialChar = passwordValidation.MetRequirements.SpecialChar,
                                metCount = passwordValidation.MetRequirements.MetCount,
                                totalRequired = passwordValidation.MetRequirements.TotalRequired
                            }
                        }
                    });
                }

                // 3. Check if email exists
                string sqlCheckUserExists = "SELECT COUNT(1) FROM [User] WHERE User_Email = @Email";
                var emailExists = _dapper.LoadDataSingle<int>(
                    sqlCheckUserExists,
                    new { Email = userForRegistration.User_Email }
                );

                if (emailExists > 0)
                {
                    return Conflict(new
                    {
                        status = false,
                        message = "Email already registered",
                        errors = new[] { "This email address is already in use. Please use a different email or login instead." }
                    });
                }

                // 4. Validate email format (basic)
                if (string.IsNullOrWhiteSpace(userForRegistration.User_Email) ||
                    !userForRegistration.User_Email.Contains("@"))
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Invalid email address",
                        errors = new[] { "Please provide a valid email address (e.g., name@example.com)" }
                    });
                }

                // Generate password hash & salt
                byte[] passwordSalt = new byte[128 / 8];
                using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
                {
                    rng.GetNonZeroBytes(passwordSalt);
                }

                byte[] passwordHash = GetPasswordHash(userForRegistration.Password, passwordSalt);

                int userId;

                if (userForRegistration.User_IsCompany)
                {
                    // Validate company fields
                    var companyErrors = new List<string>();
                    if (string.IsNullOrEmpty(userForRegistration.Company_Name))
                        companyErrors.Add("Company name is required");
                    if (string.IsNullOrEmpty(userForRegistration.Company_Address))
                        companyErrors.Add("Company address is required");
                    if (string.IsNullOrEmpty(userForRegistration.Company_TaxNumber))
                        companyErrors.Add("Tax number / VAT ID is required");
                    if (string.IsNullOrEmpty(userForRegistration.Company_PostCode))
                        companyErrors.Add("Post code is required");
                    if (string.IsNullOrEmpty(userForRegistration.Company_City))
                        companyErrors.Add("City is required");
                    if (string.IsNullOrEmpty(userForRegistration.Company_Country))
                        companyErrors.Add("Country is required");

                    if (companyErrors.Any())
                    {
                        return BadRequest(new
                        {
                            status = false,
                            message = "Missing required company information",
                            errors = companyErrors
                        });
                    }

                    // Insert company user
                    string sqlInsertCompanyUser = @"
INSERT INTO [User] (
    User_FullName, 
    User_Email, 
    User_IsCompany, 
    PasswordHash, 
    PasswordSalt, 
    SuperAdmin,
    Company_Name,
    Company_Address,
    Company_TaxNumber,
    Company_PostCode,
    Company_City,
    Company_Country,
    Company_Phone,
    Company_CreatedAt,
    User_Phone
) VALUES (
    @User_FullName, 
    @User_Email, 
    1, 
    @PasswordHash, 
    @PasswordSalt, 
    0,
    @Company_Name,
    @Company_Address,
    @Company_TaxNumber,
    @Company_PostCode,
    @Company_City,
    @Company_Country,
    @Company_Phone,
    GETDATE(),
    @User_Phone
);

SELECT CAST(SCOPE_IDENTITY() AS int);
";

                    var companyParams = new
                    {
                        User_FullName = userForRegistration.Company_Name,
                        User_Email = userForRegistration.User_Email,
                        PasswordHash = passwordHash,
                        PasswordSalt = passwordSalt,
                        Company_Name = userForRegistration.Company_Name,
                        Company_Address = userForRegistration.Company_Address,
                        Company_TaxNumber = userForRegistration.Company_TaxNumber,
                        Company_PostCode = userForRegistration.Company_PostCode,
                        Company_City = userForRegistration.Company_City,
                        Company_Country = userForRegistration.Company_Country,
                        Company_Phone = userForRegistration.Company_Phone ?? "",
                        User_Phone = userForRegistration.User_Phone ?? ""
                    };

                    userId = _dapper.LoadDataSingle<int>(sqlInsertCompanyUser, companyParams);
                }
                else
                {
                    // Validate natural person fields
                    if (string.IsNullOrEmpty(userForRegistration.User_FullName))
                    {
                        return BadRequest(new
                        {
                            status = false,
                            message = "Full name is required",
                            errors = new[] { "Please enter your full name" }
                        });
                    }

                    // Insert natural person
                    string sqlInsertUser = @"
INSERT INTO [User] (
    User_FullName, 
    User_Email, 
    User_IsCompany, 
    PasswordHash, 
    PasswordSalt, 
    SuperAdmin,
    User_Phone
) VALUES (
    @User_FullName, 
    @User_Email, 
    0, 
    @PasswordHash, 
    @PasswordSalt, 
    0,
    @User_Phone
);

SELECT CAST(SCOPE_IDENTITY() AS int);
";

                    var userParams = new
                    {
                        User_FullName = userForRegistration.User_FullName,
                        User_Email = userForRegistration.User_Email,
                        PasswordHash = passwordHash,
                        PasswordSalt = passwordSalt,
                        User_Phone = userForRegistration.User_Phone ?? ""
                    };

                    userId = _dapper.LoadDataSingle<int>(sqlInsertUser, userParams);
                }

                if (userId <= 0)
                {
                    return StatusCode(500, new
                    {
                        status = false,
                        message = "Registration failed",
                        errors = new[] { "An error occurred while creating your account. Please try again." }
                    });
                }

                // Retrieve user
                string getUserSql = "SELECT * FROM [User] WHERE User_Id = @UserId";
                var user = _dapper.LoadDataSingleOrDefault<User>(
                    getUserSql,
                    new { UserId = userId }
                );

                if (user == null)
                {
                    return StatusCode(500, new
                    {
                        status = false,
                        message = "Account created but failed to retrieve user data",
                        errors = new[] { "Please try logging in with your new account." }
                    });
                }

                return Ok(new
                {
                    status = true,
                    token = CreateToken(user),
                    message = "✅ Registration successful! Welcome to Proteinisi!",
                    user = new
                    {
                        user.User_Id,
                        user.User_FullName,
                        user.User_Email,
                        user.User_IsCompany,
                        user.SuperAdmin,
                        user.User_Phone,
                        Company = user.User_IsCompany == true ? new
                        {
                            user.Company_Name,
                            user.Company_Address,
                            user.Company_TaxNumber,
                            user.Company_PostCode,
                            user.Company_City,
                            user.Company_Country,
                            user.Company_Phone,
                            user.Company_CreatedAt
                        } : null
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = false,
                    message = "Registration error",
                    errors = new[] { $"An unexpected error occurred: {ex.Message}" }
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        public IActionResult Login([FromBody] UserForLoginDto userForLogin)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(userForLogin.User_Email))
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Email address is required",
                    errors = new[] { "Please enter your email address" }
                });
            }

            if (string.IsNullOrWhiteSpace(userForLogin.Password))
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Password is required",
                    errors = new[] { "Please enter your password" }
                });
            }

            // Get password hash and salt
            string sqlForHashAndSalt = @"
SELECT PasswordHash, PasswordSalt, SuperAdmin
FROM [User]
WHERE User_Email = @User_Email";

            var parameters = new { User_Email = userForLogin.User_Email };

            var userForConfirmation = _dapper.LoadDataSingleOrDefault<UserForLoginConfirmationDto>(
                sqlForHashAndSalt,
                parameters
            );

            // Check if user exists
            if (userForConfirmation == null || userForConfirmation.PasswordSalt == null)
            {
                // Use generic message for security (don't reveal if email exists or password is wrong)
                return Unauthorized(new
                {
                    status = false,
                    message = "Invalid email or password",
                    errors = new[] { "The email address or password you entered is incorrect. Please try again." }
                });
            }

            // Hash provided password
            byte[] passwordHash = GetPasswordHash(userForLogin.Password, userForConfirmation.PasswordSalt);

            // Compare password hashes without leaking timing information.
            if (!CryptographicOperations.FixedTimeEquals(passwordHash, userForConfirmation.PasswordHash))
            {
                // Generic message for wrong password (security best practice)
                return Unauthorized(new
                {
                    status = false,
                    message = "Invalid email or password",
                    errors = new[] { "The email address or password you entered is incorrect. Please try again." }
                });
            }

            // Load full user object for token
            string sql = @"
SELECT * FROM [User]
WHERE User_Email = @User_Email";

            var user = _dapper.LoadDataSingleOrDefault<User>(sql, parameters);

            if (user == null)
            {
                return StatusCode(500, new
                {
                    status = false,
                    message = "Login failed",
                    errors = new[] { "Authentication succeeded but failed to retrieve user data. Please try again." }
                });
            }

            // Return token
            return Ok(new
            {
                status = true,
                token = CreateToken(user),
                message = "✅ Login successful! Welcome back!",
                user = new
                {
                    user.User_Id,
                    user.User_FullName,
                    user.User_Email,
                    user.User_IsCompany,
                    user.SuperAdmin,
                    user.User_Phone,
                    Company = user.User_IsCompany ? new
                    {
                        user.Company_Name,
                        user.Company_Address,
                        user.Company_TaxNumber,
                        user.Company_PostCode,
                        user.Company_City,
                        user.Company_Country,
                        user.Company_Phone,
                        user.Company_CreatedAt
                    } : null
                }
            });
        }

        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            // Check if email exists
            string sqlCheckUser = "SELECT User_Id FROM [User] WHERE User_Email = @User_Email";
            var userId = _dapper.LoadDataSingle<int>(sqlCheckUser, new { User_Email = forgotPasswordDto.User_Email });

            if (userId == 0)
            {
                // Don't reveal that the user doesn't exist (security best practice)
                return Ok(new
                {
                    status = true,
                    message = "If your email exists in our system, you will receive a password reset link."
                });
            }

            // Generate a reset token (using JWT for simplicity)
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config.GetSection("AppSettings:TokenKey").Value);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
            new Claim("userId", userId.ToString()),
            new Claim("reset", "true") // Special claim for password reset
                }),
                Expires = DateTime.UtcNow.AddHours(1), // Token valid for 1 hour
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Store the token in database, reset the IsResetTokenUsed flag
            string sqlStoreToken = @"
UPDATE [User] 
SET 
    ResetToken = @Token, 
    ResetTokenExpiration = @Expires,
    IsResetTokenUsed = 0  -- Reset the used flag for new token
WHERE User_Id = @UserId";

            _dapper.ExecuteSql(sqlStoreToken, new
            {
                Token = tokenString,
                Expires = DateTime.UtcNow.AddHours(1),
                UserId = userId
            });

            // Send email with reset link
            var mailSettings = _config.GetSection("MailSettings");
            MailModel mm = new MailModel();
            mm.SMTPPort = mailSettings.GetValue<int?>("SMTPPort") ?? 587;
            mm.host = mailSettings["host"] ?? throw new InvalidOperationException("MailSettings:host is not configured.");
            mm.sender_username = mailSettings["sender_username"] ?? throw new InvalidOperationException("MailSettings:sender_username is not configured.");
            mm.sender_email = mailSettings["sender_email"] ?? throw new InvalidOperationException("MailSettings:sender_email is not configured.");
            mm.sender_name = mailSettings["sender_name"] ?? "Proteini.mk";
            mm.sender_password = mailSettings["sender_password"] ?? throw new InvalidOperationException("MailSettings:sender_password is not configured.");
            mm.CheckCertificateRevocation = mailSettings.GetValue<bool?>("CheckCertificateRevocation") ?? true;
            var receipients = new List<string>() { forgotPasswordDto.User_Email };
            mm.ToRecipients = receipients;
            mm.content = $"Please reset your password by clicking here: <a href=\"https://proteini.mk/reset-password?token={tokenString}\">Reset Password</a>";
            mm.EnableSsl = true;
            mm.subject = "Password Reset Request";

            SendEmail(mm);

            return Ok(new
            {
                status = true,
                message = "If your email exists in our system, you will receive a password reset link."
            });
        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            // Check if passwords match
            if (resetPasswordDto.NewPassword != resetPasswordDto.ConfirmPassword)
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Passwords don't match",
                    errors = new[] { "The passwords you entered do not match. Please try again." }
                });
            }

            // Validate password strength
            var passwordValidation = PasswordValidator.Validate(resetPasswordDto.NewPassword);
            if (!passwordValidation.IsValid)
            {
                return BadRequest(new
                {
                    status = false,
                    message = $"Password needs {passwordValidation.Errors.Count} more requirement(s)",
                    errors = passwordValidation.Errors,
                    strength = new
                    {
                        percent = passwordValidation.MetRequirements.StrengthPercent,
                        description = PasswordValidator.GetStrengthDescription(passwordValidation.MetRequirements.StrengthPercent),
                        metRequirements = new
                        {
                            minLength = passwordValidation.MetRequirements.MinLength,
                            uppercase = passwordValidation.MetRequirements.Uppercase,
                            lowercase = passwordValidation.MetRequirements.Lowercase,
                            digit = passwordValidation.MetRequirements.Digit,
                            specialChar = passwordValidation.MetRequirements.SpecialChar,
                            metCount = passwordValidation.MetRequirements.MetCount,
                            totalRequired = passwordValidation.MetRequirements.TotalRequired
                        }
                    }
                });
            }

            // Validate the token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config.GetSection("AppSettings:TokenKey").Value);

            try
            {
                tokenHandler.ValidateToken(resetPasswordDto.Token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                // Additional check for reset token claim
                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = int.Parse(jwtToken.Claims.First(x => x.Type == "userId").Value);
                var isResetToken = jwtToken.Claims.Any(x => x.Type == "reset" && x.Value == "true");

                if (!isResetToken)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Already used or expired!",
                        errors = new[] { "This token is not valid for password reset." }
                    });
                }

                // Check against database-stored token (includes one-time use check)
                string sqlCheckToken = @"
SELECT 
    ResetToken, 
    ResetTokenExpiration, 
    IsResetTokenUsed 
FROM [User] 
WHERE User_Id = @UserId";

                var tokenInfo = _dapper.LoadDataSingle<(string Token, DateTime Expires, bool IsUsed)>(
                    sqlCheckToken,
                    new { UserId = userId }
                );

                // Check if token is valid
                if (tokenInfo.Token != resetPasswordDto.Token)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Already used or expired!",
                        errors = new[] { "This reset link is invalid. Please request a new one." }
                    });
                }

                // Check if token has already been used (ONE-TIME USE CHECK)
                if (tokenInfo.IsUsed)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Token already used",
                        errors = new[] { "This password reset link has already been used. Please request a new one if you need to reset your password again." }
                    });
                }

                // Check if token has expired
                if (tokenInfo.Expires < DateTime.UtcNow)
                {
                    return BadRequest(new
                    {
                        status = false,
                        message = "Token expired",
                        errors = new[] { "Your password reset link has expired. Please request a new one." }
                    });
                }

                // Generate new password hash and salt
                byte[] passwordSalt = new byte[128 / 8];
                using (RandomNumberGenerator rng = RandomNumberGenerator.Create())
                {
                    rng.GetNonZeroBytes(passwordSalt);
                }
                byte[] passwordHash = GetPasswordHash(resetPasswordDto.NewPassword, passwordSalt);

                // Update password, clear reset token, AND mark it as used (ONE-TIME USE)
                string sqlUpdatePassword = @"
UPDATE [User] 
SET 
    PasswordHash = @PasswordHash, 
    PasswordSalt = @PasswordSalt, 
    ResetToken = NULL, 
    ResetTokenExpiration = NULL,
    IsResetTokenUsed = 1  -- Mark as used
WHERE User_Id = @UserId";

                _dapper.ExecuteSql(sqlUpdatePassword, new
                {
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt,
                    UserId = userId
                });

                return Ok(new
                {
                    status = true,
                    message = "✅ Password has been reset successfully! You can now login with your new password."
                });
            }
            catch (SecurityTokenExpiredException)
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Token has expired",
                    errors = new[] { "Your password reset link has expired. Please request a new one." }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    status = false,
                    message = "Invalid token",
                    errors = new[] { "Unable to reset password. Please request a new reset link." }
                });
            }
        }

        [HttpGet("Current")]
        public IActionResult GetCurrentUser()
        {
            // Get userId from token claims
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "User not authenticated" });

            int userId = int.Parse(userIdClaim);

            string sql = @"
SELECT 
    User_Id, 
    User_FullName, 
    User_Email, 
    User_IsCompany, 
    SuperAdmin,
    User_Phone,
    User_Address,
    User_PostCode,
    User_City,
    User_Country,
    Company_Name,
    Company_Address,
    Company_TaxNumber,
    Company_PostCode,
    Company_City,
    Company_Country,
    Company_Phone,
    Company_CreatedAt
FROM [User]
WHERE User_Id = @User_Id";

            var user = _dapper.LoadDataSingleOrDefault<User>(sql, new { User_Id = userId });

            if (user == null)
                return NotFound(new { message = "User not found" });

            // Return user data with proper structure
            return Ok(new
            {
                user_Id = user.User_Id,
                user_FullName = user.User_FullName,
                user_Email = user.User_Email,
                user_IsCompany = user.User_IsCompany,
                superAdmin = user.SuperAdmin,
                user_Phone = user.User_Phone,
                user_Address = user.User_Address,
                user_PostCode = user.User_PostCode,
                user_City = user.User_City,
                user_Country = user.User_Country,
                // Company object with all company fields (even if null)
                company = user.User_IsCompany ? new
                {
                    company_Name = user.Company_Name,
                    company_Address = user.Company_Address,
                    company_TaxNumber = user.Company_TaxNumber,
                    company_PostCode = user.Company_PostCode,
                    company_City = user.Company_City,
                    company_Country = user.Company_Country,
                    company_Phone = user.Company_Phone,
                    company_CreatedAt = user.Company_CreatedAt
                } : null
            });
        }

        [HttpPut("UpdateBillingInfo")]
        public IActionResult UpdateBillingInfo([FromBody] UserForUpdateDto updateInfo)
        {
            try
            {
                // Get userId from token claims
                var userIdClaim = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(new { message = "User not authenticated" });

                int userId = int.Parse(userIdClaim);

                // First, get current user to check account type
                string getUserSql = "SELECT User_IsCompany FROM [User] WHERE User_Id = @UserId";
                var user = _dapper.LoadDataSingleOrDefault<User>(getUserSql, new { UserId = userId });

                if (user == null)
                    return NotFound(new { message = "User not found" });

                string updateSql;
                object parameters;

                if (user.User_IsCompany)
                {
                    // Update company fields
                    updateSql = @"
UPDATE [User] SET
    Company_Name = ISNULL(@Company_Name, Company_Name),
    Company_Address = ISNULL(@Company_Address, Company_Address),
    Company_TaxNumber = ISNULL(@Company_TaxNumber, Company_TaxNumber),
    Company_PostCode = ISNULL(@Company_PostCode, Company_PostCode),
    Company_City = ISNULL(@Company_City, Company_City),
    Company_Country = ISNULL(@Company_Country, Company_Country),
    Company_Phone = ISNULL(@Company_Phone, Company_Phone)
WHERE User_Id = @UserId";

                    parameters = new
                    {
                        UserId = userId,
                        Company_Name = updateInfo.Company_Name,
                        Company_Address = updateInfo.Company_Address,
                        Company_TaxNumber = updateInfo.Company_TaxNumber,
                        Company_PostCode = updateInfo.Company_PostCode,
                        Company_City = updateInfo.Company_City,
                        Company_Country = updateInfo.Company_Country,
                        Company_Phone = updateInfo.Company_Phone
                    };
                }
                else
                {
                    // Update natural person billing fields
                    updateSql = @"
UPDATE [User] SET
    User_Address = ISNULL(@User_Address, User_Address),
    User_PostCode = ISNULL(@User_PostCode, User_PostCode),
    User_City = ISNULL(@User_City, User_City),
    User_Country = ISNULL(@User_Country, User_Country),
    User_Phone = ISNULL(@User_Phone, User_Phone)
WHERE User_Id = @UserId";

                    parameters = new
                    {
                        UserId = userId,
                        User_Address = updateInfo.User_Address,
                        User_PostCode = updateInfo.User_PostCode,
                        User_City = updateInfo.User_City,
                        User_Country = updateInfo.User_Country,
                        User_Phone = updateInfo.User_Phone
                    };
                }

                var rowsAffected = _dapper.ExecuteSqlWithRowCount(updateSql, parameters);

                if (rowsAffected == 0)
                    return StatusCode(500, new { message = "Failed to update billing information" });

                // Fetch and return updated user data
                string getUpdatedUserSql = @"
SELECT 
    User_Id, 
    User_FullName, 
    User_Email, 
    User_IsCompany, 
    SuperAdmin,
    User_Phone,
    User_Address,
    User_PostCode,
    User_City,
    User_Country,
    Company_Name,
    Company_Address,
    Company_TaxNumber,
    Company_PostCode,
    Company_City,
    Company_Country,
    Company_Phone,
    Company_CreatedAt
FROM [User] 
WHERE User_Id = @UserId";

                var updatedUser = _dapper.LoadDataSingleOrDefault<User>(getUpdatedUserSql, new { UserId = userId });

                return Ok(new
                {
                    status = true,
                    message = "Billing information updated successfully",
                    user = new
                    {
                        updatedUser.User_Id,
                        updatedUser.User_FullName,
                        updatedUser.User_Email,
                        updatedUser.User_IsCompany,
                        updatedUser.SuperAdmin,
                        updatedUser.User_Phone,
                        updatedUser.User_Address,
                        updatedUser.User_PostCode,
                        updatedUser.User_City,
                        updatedUser.User_Country,
                        Company = updatedUser.User_IsCompany ? new
                        {
                            updatedUser.Company_Name,
                            updatedUser.Company_Address,
                            updatedUser.Company_TaxNumber,
                            updatedUser.Company_PostCode,
                            updatedUser.Company_City,
                            updatedUser.Company_Country,
                            updatedUser.Company_Phone,
                            updatedUser.Company_CreatedAt
                        } : null
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Update failed: {ex.Message}" });
            }
        }

        private void SendEmail(MailModel mailModel)
        {
            try
            {
                var message = new MimeKit.MimeMessage();
                message.From.Add(new MimeKit.MailboxAddress(mailModel.sender_name, mailModel.sender_email));

                foreach (var recipient in mailModel.ToRecipients)
                    message.To.Add(MimeKit.MailboxAddress.Parse(recipient));

                message.Subject = mailModel.subject;
                message.Body = new MimeKit.BodyBuilder
                {
                    HtmlBody = mailModel.content
                }.ToMessageBody();

                using var client = new MailKit.Net.Smtp.SmtpClient();
                client.CheckCertificateRevocation = mailModel.CheckCertificateRevocation;
                var socketOptions = mailModel.EnableSsl
                    ? (mailModel.SMTPPort == 465 ? MailKit.Security.SecureSocketOptions.SslOnConnect : MailKit.Security.SecureSocketOptions.StartTls)
                    : MailKit.Security.SecureSocketOptions.None;

                client.Connect(mailModel.host, mailModel.SMTPPort, socketOptions);
                client.Authenticate(mailModel.sender_username, mailModel.sender_password);
                client.Send(message);
                client.Disconnect(true);
            }
            catch (Exception ex)
            {
                // Log the error (you should implement proper logging)
                Console.WriteLine($"Error sending email: {ex.Message}");
            }
        }

        private byte[] GetPasswordHash(string password, byte[] passwordSalt)
        {
            var passwordKey = _config["AppSettings:PasswordKey"];
            if (string.IsNullOrWhiteSpace(passwordKey))
                throw new InvalidOperationException("AppSettings:PasswordKey is not configured.");

            string passwordSaltPlusString = passwordKey + Convert.ToBase64String(passwordSalt);

            return KeyDerivation.Pbkdf2(
                password: password,
                salt: Encoding.ASCII.GetBytes(passwordSaltPlusString),
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 1000000,
                numBytesRequested: 256 / 8
                );
        }

        private string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim("userId", user.User_Id.ToString()),
                new Claim("fullName", user.User_FullName ?? string.Empty),
                new Claim("email", user.User_Email ?? string.Empty),
                new Claim("isCompany", user.User_IsCompany.ToString()),
                new Claim("superAdmin", user.SuperAdmin.ToString())
            };

            var tokenKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config.GetSection("Appsettings:TokenKey").Value)
            );

            var credentials = new SigningCredentials(tokenKey, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                SigningCredentials = credentials,
                Expires = DateTime.Now.AddDays(1)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
