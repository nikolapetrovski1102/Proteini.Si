namespace ProteiniSi.Contracts.Services;

/// <summary>
/// Purges cached copies of files at the CDN edge (Cloudflare). When the CDN is not
/// configured every call is a no-op, so local and stage environments keep working.
/// </summary>
public interface ICdnCacheService
{
    bool IsConfigured { get; }

    /// <summary>Purges the given web paths (e.g. "/home-slider/a.png") on every public host.</summary>
    Task<bool> PurgePathsAsync(IEnumerable<string> webPaths, CancellationToken cancellationToken = default);

    /// <summary>Purges the whole zone cache.</summary>
    Task<bool> PurgeEverythingAsync(CancellationToken cancellationToken = default);
}
