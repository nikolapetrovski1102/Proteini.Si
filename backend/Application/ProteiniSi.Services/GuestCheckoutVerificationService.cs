using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

/// <summary>
/// Guests paying cash on delivery must prove they own the email they type in, which stops
/// fake orders with invented addresses. Pending codes live in memory (only an HMAC of the code
/// is kept); a confirmed email gets a signed, short-lived token that the order request carries.
/// </summary>
public class GuestCheckoutVerificationService(IMemoryCache cache, IEmailSender emailSender, IConfiguration config, IAnalyticsService analytics)
    : IGuestCheckoutVerificationService
{
    public const int CodeValidMinutes = 15;
    public const int ResendCooldownSeconds = 60;
    public const int MaxAttempts = 5;
    public const int MaxSendsPerHour = 5;
    public static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(2);

    private const string SentMessage = "We sent a 6-digit code to your email.";

    private sealed class PendingCode
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

    public async Task<GuestCheckoutCodeSentDto> SendCodeAsync(GuestCheckoutCodeRequestDto request)
    {
        var email = NormalizeEmail(request.Email)
            ?? throw Error("Invalid email address", "Please enter a valid email address.");

        var now = DateTime.UtcNow;
        if (cache.TryGetValue(CodeKey(email), out PendingCode? existing) && existing != null)
        {
            var wait = ResendCooldownSeconds - (int)(now - existing.SentAt).TotalSeconds;
            if (wait > 0)
                return new GuestCheckoutCodeSentDto(true, SentMessage, wait);
        }

        var counter = cache.GetOrCreate(SendsKey(email), entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return new SendCounter();
        })!;
        if (Interlocked.Increment(ref counter.Count) > MaxSendsPerHour)
            throw Error("Too many codes requested", "Too many codes were requested for this email. Please try again in an hour.");

        var code = EmailVerificationCode.Generate();
        cache.Set(CodeKey(email), new PendingCode
        {
            Hash = HashCode(email, code),
            ExpiresAt = now.AddMinutes(CodeValidMinutes),
            SentAt = now
        }, TimeSpan.FromMinutes(CodeValidMinutes));

        var (subject, html) = VerificationEmailTemplate.BuildCheckout(request.Name, code, CodeValidMinutes, request.Language);
        await emailSender.SendAsync([email], subject, html);
        await analytics.RecordCheckoutLeadAsync(email, request.Name, request.MarketingConsent);

        return new GuestCheckoutCodeSentDto(true, SentMessage, ResendCooldownSeconds);
    }

    public GuestCheckoutVerifiedDto ConfirmCode(GuestCheckoutCodeConfirmDto request)
    {
        var email = NormalizeEmail(request.Email)
            ?? throw Error("Invalid email address", "Please enter a valid email address.");
        var code = EmailVerificationCode.Normalize(request.Code)
            ?? throw Error("Invalid code", "Please enter the 6-digit code from the email.");

        if (!cache.TryGetValue(CodeKey(email), out PendingCode? pending) || pending == null || pending.ExpiresAt < DateTime.UtcNow)
            throw Error("Code expired", "The code has expired. Please request a new one.");

        var attempts = Interlocked.Increment(ref pending.Attempts);
        if (attempts > MaxAttempts)
        {
            cache.Remove(CodeKey(email));
            throw Error("Too many attempts", "Too many incorrect attempts. Please request a new code.");
        }

        if (!EmailVerificationCode.Matches(pending.Hash, HashCode(email, code)))
        {
            var left = MaxAttempts - attempts;
            if (left <= 0)
                cache.Remove(CodeKey(email));

            throw new BadRequestException("Invalid code", new
            {
                status = false,
                message = left > 0
                    ? $"The code is not correct. You have {left} attempt(s) left."
                    : "Too many incorrect attempts. Please request a new code.",
                attemptsLeft = Math.Max(left, 0)
            });
        }

        cache.Remove(CodeKey(email));
        return new GuestCheckoutVerifiedDto(true, "Email confirmed.", CreateToken(email, DateTime.UtcNow.Add(TokenLifetime)));
    }

    public bool IsVerified(string? email, string? verificationToken)
    {
        var normalized = NormalizeEmail(email);
        if (normalized == null || string.IsNullOrWhiteSpace(verificationToken))
            return false;

        var parts = verificationToken.Trim().Split('.');
        if (parts.Length != 2 || !long.TryParse(parts[0], NumberStyles.None, CultureInfo.InvariantCulture, out var expiresUnix))
            return false;

        if (DateTimeOffset.FromUnixTimeSeconds(expiresUnix) < DateTimeOffset.UtcNow)
            return false;

        var expected = Encoding.ASCII.GetBytes(Sign(normalized, expiresUnix));
        var received = Encoding.ASCII.GetBytes(parts[1].ToLowerInvariant());
        return CryptographicOperations.FixedTimeEquals(expected, received);
    }

    private string CreateToken(string email, DateTime expiresAtUtc)
    {
        var expiresUnix = new DateTimeOffset(expiresAtUtc).ToUnixTimeSeconds();
        return $"{expiresUnix}.{Sign(email, expiresUnix)}";
    }

    private string Sign(string email, long expiresUnix) =>
        Convert.ToHexString(Hmac($"guest-checkout-verified:{email}:{expiresUnix}")).ToLowerInvariant();

    private byte[] HashCode(string email, string code) => Hmac($"guest-checkout-code:{email}:{code}");

    private byte[] Hmac(string value)
    {
        var key = config["AppSettings:TokenKey"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("AppSettings:TokenKey is not configured.");

        return HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.UTF8.GetBytes(value));
    }

    private static string? NormalizeEmail(string? email)
    {
        var value = email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(value) || value.Length > 254)
            return null;

        var at = value.IndexOf('@');
        return at > 0 && at == value.LastIndexOf('@') && value.IndexOf('.', at) > at + 1 && !value.EndsWith('.') && !value.Any(char.IsWhiteSpace)
            ? value
            : null;
    }

    private static string CodeKey(string email) => $"guest-checkout-code:{email}";

    private static string SendsKey(string email) => $"guest-checkout-sends:{email}";

    private static BadRequestException Error(string message, string detail) =>
        new(message, new { status = false, message = detail });
}
