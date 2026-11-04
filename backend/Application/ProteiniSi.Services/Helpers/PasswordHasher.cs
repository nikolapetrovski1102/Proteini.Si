using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace ProteiniSi.Services.Helpers;

public static class PasswordHasher
{
    public static byte[] CreateSalt()
    {
        var salt = new byte[128 / 8];
        using var rng = RandomNumberGenerator.Create();
        rng.GetNonZeroBytes(salt);
        return salt;
    }

    public static byte[] Hash(string password, byte[] passwordSalt, string? passwordKey)
    {
        if (string.IsNullOrWhiteSpace(passwordKey))
            throw new InvalidOperationException("AppSettings:PasswordKey is not configured.");

        return KeyDerivation.Pbkdf2(
            password: password,
            salt: Encoding.ASCII.GetBytes(passwordKey + Convert.ToBase64String(passwordSalt)),
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 1000000,
            numBytesRequested: 256 / 8);
    }
}
