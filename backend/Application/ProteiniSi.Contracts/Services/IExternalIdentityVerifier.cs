namespace ProteiniSi.Contracts.Services;

/// <summary>An identity a sign-in provider vouched for. Email is null when the provider withheld it.</summary>
public sealed record ExternalIdentity(string Provider, string ProviderKey, string? Email, bool EmailVerified, string? Name);

/// <summary>Checks a token issued to the browser by a sign-in provider and returns who it belongs to.</summary>
public interface IExternalIdentityVerifier
{
    /// <summary>Provider id stored in dbo.UserLogin (e.g. "google").</summary>
    string Provider { get; }

    bool IsConfigured { get; }

    /// <summary>
    /// Returns null when the credential is invalid, expired or issued to another app.
    /// Google: the authorization code from the popup flow.
    /// </summary>
    Task<ExternalIdentity?> VerifyAsync(string credential, CancellationToken cancellationToken = default);
}
