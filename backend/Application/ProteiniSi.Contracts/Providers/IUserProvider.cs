using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface IUserProvider
{
    Task<User?> GetByIdAsync(int userId);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string? email);
    Task<int> GetIdByEmailAsync(string? email);
    Task<int?> RegisterAsync(NewUser user);
    Task SetResetTokenAsync(int userId, string token, DateTime expires);
    Task<ResetTokenInfo?> GetResetTokenAsync(int userId);
    Task<bool> ResetPasswordAsync(int userId, string token, byte[] passwordHash, byte[] passwordSalt);
    Task<int> UpdateBillingInfoAsync(int userId, UserForUpdateDto info);
    Task SetEmailCodeAsync(int userId, byte[] codeHash, DateTime expiresAt, DateTime sentAt);
    Task<EmailCodeInfo?> GetEmailCodeAsync(int userId);
    Task<int> IncrementEmailCodeAttemptsAsync(int userId);
    Task<bool> ConfirmEmailAsync(int userId, byte[] codeHash, DateTime confirmedAt);
}
