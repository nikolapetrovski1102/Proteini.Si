using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

/// <summary>Pulls the shop's latest posts from the Instagram API into the gallery.</summary>
public interface IInstagramFeedSyncService
{
    bool IsConfigured { get; }

    /// <summary>The last finished run (null before the first one).</summary>
    InstagramSyncResultDto? LastResult { get; }

    Task<InstagramSyncResultDto> SyncAsync(CancellationToken cancellationToken = default);
}
