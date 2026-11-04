using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class UserProvider(ISqlHelper sql) : IUserProvider
{
    public Task<User?> GetByIdAsync(int userId) =>
        sql.QuerySingleOrDefaultAsync<User>(StoredProcedures.Users.GetById, new { UserId = userId });

    public Task<User?> GetByEmailAsync(string email) =>
        sql.QuerySingleOrDefaultAsync<User>(StoredProcedures.Users.GetByEmail, new { Email = email });

    public async Task<bool> EmailExistsAsync(string? email) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Users.EmailExists, new { Email = email }) > 0;

    public async Task<int> GetIdByEmailAsync(string? email) =>
        await sql.ExecuteScalarAsync<int?>(StoredProcedures.Users.GetIdByEmail, new { Email = email }) ?? 0;

    public async Task<int?> RegisterAsync(NewUser user)
    {
        var row = await sql.QuerySingleOrDefaultAsync<RegisterResultRow>(StoredProcedures.Users.Register, new
        {
            user.User_FullName,
            user.User_Email,
            user.User_IsCompany,
            user.PasswordHash,
            user.PasswordSalt,
            user.User_Phone,
            user.Company_Name,
            user.Company_Address,
            user.Company_TaxNumber,
            user.Company_PostCode,
            user.Company_City,
            user.Company_Country,
            user.Company_Phone
        });

        return row!.Result == 0 ? row.UserId : null;
    }

    public Task SetResetTokenAsync(int userId, string token, DateTime expires) =>
        sql.ExecuteAsync(StoredProcedures.Users.SetResetToken, new { UserId = userId, Token = token, Expires = expires });

    public Task<ResetTokenInfo?> GetResetTokenAsync(int userId) =>
        sql.QuerySingleOrDefaultAsync<ResetTokenInfo>(StoredProcedures.Users.GetResetToken, new { UserId = userId });

    public async Task<bool> ResetPasswordAsync(int userId, string token, byte[] passwordHash, byte[] passwordSalt) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.Users.ResetPassword, new
        {
            UserId = userId,
            Token = token,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        }) > 0;

    public Task<int> UpdateBillingInfoAsync(int userId, UserForUpdateDto info) =>
        sql.ExecuteScalarAsync<int>(StoredProcedures.Users.UpdateBillingInfo, new
        {
            UserId = userId,
            info.User_Address,
            info.User_PostCode,
            info.User_City,
            info.User_Country,
            info.User_Phone,
            info.Company_Name,
            info.Company_Address,
            info.Company_TaxNumber,
            info.Company_PostCode,
            info.Company_City,
            info.Company_Country,
            info.Company_Phone
        });

    private sealed class RegisterResultRow
    {
        public int Result { get; init; }
        public int? UserId { get; init; }
    }
}
