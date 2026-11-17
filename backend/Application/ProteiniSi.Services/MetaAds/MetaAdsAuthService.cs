using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DuoUniversal;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services.MetaAds;

/// <summary>
/// Sign-in for meta-ads.proteini.mk. Duo Universal Prompt is the main way in; a 6-digit email code is the fallback.
/// Pending Duo states and email codes live in memory (only an HMAC of a code is kept); both are single use.
/// </summary>
public class MetaAdsAuthService(IConfiguration config, IMemoryCache cache, IEmailSender emailSender, ILogger<MetaAdsAuthService> logger)
    : IMetaAdsAuthService
{
    public const int CodeValidMinutes = 10;
    public const int ResendCooldownSeconds = 60;
    public const int MaxAttempts = 5;
    public const int MaxSendsPerHour = 5;
    private static readonly TimeSpan DuoStateLifetime = TimeSpan.FromMinutes(10);
    private const string CodeSentMessage = "If this email has access, a 6-digit code is on its way.";

    private MetaAdsOptions Options => MetaAdsOptions.From(config);

    private sealed record DuoPending(string Email, string Username);

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

    public MetaAdsAuthOptionsDto GetOptions()
    {
        var options = Options;
        return new MetaAdsAuthOptionsDto(options.DuoEnabled, options.EmailCodeEnabled);
    }

    public bool IsAllowed(string? email) =>
        Normalize(email) is { } normalized && Options.Users.ContainsKey(normalized);

    // ---------- Duo ----------

    public async Task<MetaAdsDuoStartDto> StartDuoAsync(string? email)
    {
        var options = Options;
        if (!options.DuoEnabled)
            throw new BadRequestException("Duo sign-in is not set up. Use the email code instead.");

        var normalized = Normalize(email) ?? throw new BadRequestException("Please enter a valid email address.");
        if (!options.Users.TryGetValue(normalized, out var username))
        {
            logger.LogWarning("Meta ads: Duo sign-in refused for {Email} (not on MetaAds:AllowedUsers)", normalized);
            throw new ForbiddenException("This email does not have access to the Meta ads dashboard.");
        }

        var client = BuildDuoClient(options);
        bool healthy;
        try
        {
            healthy = await client.DoHealthCheck();
        }
        catch (DuoException ex)
        {
            logger.LogError(ex, "Meta ads: Duo health check failed");
            healthy = false;
        }

        if (!healthy)
            throw new ServerErrorException("Duo is not reachable right now. Use the email code instead.");

        var state = Client.GenerateState();
        cache.Set(DuoStateKey(state), new DuoPending(normalized, username), DuoStateLifetime);
        return new MetaAdsDuoStartDto(client.GenerateAuthUri(username, state));
    }

    public async Task<MetaAdsSessionDto> CompleteDuoAsync(string? state, string? code)
    {
        var options = Options;
        if (!options.DuoEnabled)
            throw new BadRequestException("Duo sign-in is not set up.");
        if (string.IsNullOrWhiteSpace(state) || string.IsNullOrWhiteSpace(code))
            throw new BadRequestException("The Duo response is incomplete. Please sign in again.");

        var key = DuoStateKey(state);
        if (!cache.TryGetValue(key, out DuoPending? pending) || pending is null)
            throw new UnauthorizedException("This Duo sign-in has expired. Please sign in again.");
        cache.Remove(key);

        IdToken token;
        try
        {
            token = await BuildDuoClient(options).ExchangeAuthorizationCodeFor2faResult(code, pending.Username);
        }
        catch (DuoException ex)
        {
            logger.LogWarning(ex, "Meta ads: Duo code exchange failed for {Email}", pending.Email);
            throw new UnauthorizedException("Duo did not confirm the sign-in. Please try again.");
        }

        if (!string.Equals(token.AuthResult?.Result, "allow", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Meta ads: Duo denied {Email}: {Status}", pending.Email, token.AuthResult?.StatusMsg);
            throw new UnauthorizedException("Duo denied the sign-in.");
        }

        // The allowlist may have changed while the user was on Duo.
        if (!options.Users.ContainsKey(pending.Email))
            throw new ForbiddenException("This email does not have access to the Meta ads dashboard.");

        logger.LogInformation("Meta ads: {Email} signed in with Duo", pending.Email);
        return CreateSession(pending.Email, "duo", options);
    }

    private Client BuildDuoClient(MetaAdsOptions options) =>
        new ClientBuilder(options.DuoClientId, options.DuoClientSecret, options.DuoApiHost, $"{options.PublicUrl}/api/meta-ads/auth/duo/callback")
            .UseDuoCodeAttribute()
            .Build();

    // ---------- Email code ----------

    public async Task<MetaAdsCodeSentDto> SendEmailCodeAsync(string? email)
    {
        var options = Options;
        if (!options.EmailCodeEnabled)
            throw new BadRequestException("Email codes are switched off. Use Duo.");

        var normalized = Normalize(email) ?? throw new BadRequestException("Please enter a valid email address.");

        // Same answer whether or not the email is on the list, so the page cannot be used to probe who has access.
        if (!options.Users.ContainsKey(normalized))
        {
            logger.LogWarning("Meta ads: email code refused for {Email} (not on MetaAds:AllowedUsers)", normalized);
            return new MetaAdsCodeSentDto(true, CodeSentMessage, ResendCooldownSeconds);
        }

        var now = DateTime.UtcNow;
        if (cache.TryGetValue(CodeKey(normalized), out PendingCode? existing) && existing is not null)
        {
            var wait = ResendCooldownSeconds - (int)(now - existing.SentAt).TotalSeconds;
            if (wait > 0)
                return new MetaAdsCodeSentDto(true, CodeSentMessage, wait);
        }

        var counter = cache.GetOrCreate(SendsKey(normalized), entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return new SendCounter();
        })!;
        if (Interlocked.Increment(ref counter.Count) > MaxSendsPerHour)
            throw new BadRequestException("Too many codes were requested. Please try again in an hour.");

        var code = EmailVerificationCode.Generate();
        cache.Set(CodeKey(normalized), new PendingCode
        {
            Hash = HashCode(normalized, code),
            ExpiresAt = now.AddMinutes(CodeValidMinutes),
            SentAt = now
        }, TimeSpan.FromMinutes(CodeValidMinutes));

        await emailSender.SendAsync([normalized], $"{code} is your Meta ads sign-in code", BuildCodeEmail(code));
        logger.LogInformation("Meta ads: sign-in code sent to {Email}", normalized);
        return new MetaAdsCodeSentDto(true, CodeSentMessage, ResendCooldownSeconds);
    }

    public MetaAdsSessionDto VerifyEmailCode(string? email, string? code)
    {
        var options = Options;
        if (!options.EmailCodeEnabled)
            throw new BadRequestException("Email codes are switched off. Use Duo.");

        var normalized = Normalize(email) ?? throw new BadRequestException("Please enter a valid email address.");
        var digits = EmailVerificationCode.Normalize(code) ?? throw new BadRequestException("Please enter the 6-digit code from the email.");

        if (!cache.TryGetValue(CodeKey(normalized), out PendingCode? pending) || pending is null || pending.ExpiresAt < DateTime.UtcNow)
            throw new BadRequestException("The code has expired. Please request a new one.");

        var attempts = Interlocked.Increment(ref pending.Attempts);
        if (attempts > MaxAttempts || !EmailVerificationCode.Matches(pending.Hash, HashCode(normalized, digits)))
        {
            var left = MaxAttempts - attempts;
            if (left <= 0)
                cache.Remove(CodeKey(normalized));
            throw new BadRequestException(left > 0
                ? $"The code is not correct. {left} attempt(s) left."
                : "Too many incorrect attempts. Please request a new code.");
        }

        cache.Remove(CodeKey(normalized));
        if (!options.Users.ContainsKey(normalized))
            throw new ForbiddenException("This email does not have access to the Meta ads dashboard.");

        logger.LogInformation("Meta ads: {Email} signed in with an email code", normalized);
        return CreateSession(normalized, "email", options);
    }

    private static string BuildCodeEmail(string code)
    {
        var rows = EmailLayout.Hero("Meta ads sign-in", "Sign-in code", EmailLayout.Tone.Yellow,
                "Use this code to sign in to the Proteini.si Meta ads dashboard:") +
            EmailLayout.Row(
                $"<div style='font-family:{EmailLayout.DisplayFont}; font-size:40px; line-height:48px; font-weight:700; letter-spacing:10px; color:{EmailLayout.Ink};'>{code}</div>") +
            EmailLayout.Row(EmailLayout.Note(
                $"The code is valid for {CodeValidMinutes} minutes and works once. If you did not try to sign in, someone else typed your email; you can ignore this message."));
        return EmailLayout.Page("Meta ads sign-in code", $"Your sign-in code is {code}", rows);
    }

    // ---------- Session ----------

    public MetaAdsSessionUser? GetUser(ClaimsPrincipal principal)
    {
        var email = principal.FindFirst(MetaAdsSession.EmailClaim)?.Value;
        if (email is null || !IsAllowed(email))
            return null;
        return new MetaAdsSessionUser(email, principal.FindFirst(MetaAdsSession.MethodClaim)?.Value ?? "");
    }

    private MetaAdsSessionDto CreateSession(string email, string method, MetaAdsOptions options)
    {
        var expires = DateTime.UtcNow.AddHours(options.SessionHours);
        var token = new JwtSecurityTokenHandler { MapInboundClaims = false }.WriteToken(new JwtSecurityToken(
            issuer: MetaAdsSession.Issuer,
            audience: MetaAdsSession.Audience,
            claims:
            [
                new Claim(MetaAdsSession.EmailClaim, email),
                new Claim(MetaAdsSession.MethodClaim, method),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            ],
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(MetaAdsSession.SigningKey(config)), SecurityAlgorithms.HmacSha256)));

        return new MetaAdsSessionDto(new MetaAdsSessionUser(email, method), token, expires);
    }

    // ---------- Helpers ----------

    private byte[] HashCode(string email, string code) =>
        HMACSHA256.HashData(MetaAdsSession.SigningKey(config), Encoding.UTF8.GetBytes($"meta-ads-code:{email}:{code}"));

    private static string? Normalize(string? email)
    {
        var value = email?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(value) || value.Length > 254)
            return null;

        var at = value.IndexOf('@');
        return at > 0 && at == value.LastIndexOf('@') && value.IndexOf('.', at) > at + 1 && !value.EndsWith('.') && !value.Any(char.IsWhiteSpace)
            ? value
            : null;
    }

    private static string DuoStateKey(string state) => $"meta-ads-duo:{state}";
    private static string CodeKey(string email) => $"meta-ads-code:{email}";
    private static string SendsKey(string email) => $"meta-ads-code-sends:{email}";
}
