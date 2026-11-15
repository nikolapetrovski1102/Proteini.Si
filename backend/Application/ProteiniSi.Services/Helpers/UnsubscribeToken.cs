using System.Security.Cryptography;
using System.Text;

namespace ProteiniSi.Services.Helpers;

/// <summary>Signed unsubscribe links: HMAC-SHA256 of the lower-cased email, base64url, so links can't be forged for other addresses.</summary>
public static class UnsubscribeToken
{
    public static string Create(string email, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes("unsubscribe:" + key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(email.Trim().ToLowerInvariant()));
        return Convert.ToBase64String(hash).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static bool Verify(string? email, string? token, string key)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(token)) return false;
        var expected = Encoding.ASCII.GetBytes(Create(email, key));
        var actual = Encoding.ASCII.GetBytes(token.Trim());
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }
}
