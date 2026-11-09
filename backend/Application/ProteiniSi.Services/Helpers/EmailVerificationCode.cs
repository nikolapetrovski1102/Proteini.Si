using System.Security.Cryptography;
using System.Text;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Six-digit email confirmation codes. Only an HMAC of the code is stored, keyed
/// with the app secret and bound to the user, so a database leak does not reveal codes.
/// </summary>
public static class EmailVerificationCode
{
    public const int Length = 6;

    public static string Generate() =>
        RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    public static byte[] Hash(int userId, string code, string key)
    {
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("AppSettings:TokenKey is not configured.");

        return HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes($"email-code:{userId}:{code}"));
    }

    /// <summary>Strips spaces and dashes; returns null unless exactly six digits remain.</summary>
    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return null;

        var digits = new string(input.Where(c => c is not (' ' or '-')).ToArray());
        return digits.Length == Length && digits.All(char.IsAsciiDigit) ? digits : null;
    }

    public static bool Matches(byte[]? storedHash, byte[] candidateHash) =>
        storedHash is { Length: > 0 } && CryptographicOperations.FixedTimeEquals(storedHash, candidateHash);
}
