namespace ProteiniSi.Contracts.Services;

/// <summary>Checks a Cloudflare Turnstile ("I'm not a robot") token from the checkout page.</summary>
public interface ITurnstileVerifier
{
    /// <summary>False when no secret key is set; the check is then skipped.</summary>
    bool IsEnabled { get; }

    Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default);
}
