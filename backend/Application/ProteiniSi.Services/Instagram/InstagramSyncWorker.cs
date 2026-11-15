using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services.Instagram;

/// <summary>
/// Pulls the Instagram feed once a week (Instagram:SyncIntervalDays, default 7): new posts are added,
/// existing ones get fresh captions, likes and pictures. The time of the last successful sync is
/// kept in App_Data/instagram-sync.json, so restarts and deploys don't reset the weekly schedule.
/// A failed sync is retried every few hours until it succeeds. Admins can still sync right away
/// with POST /api/InstagramPosts/sync.
/// </summary>
public class InstagramSyncWorker(
    IInstagramFeedSyncService sync,
    IConfiguration config,
    IWebHostEnvironment environment,
    ILogger<InstagramSyncWorker> logger) : BackgroundService
{
    private static readonly TimeSpan CheckEvery = TimeSpan.FromHours(1);
    private static readonly TimeSpan RetryAfterFailure = TimeSpan.FromHours(6);

    private string StatePath => Path.Combine(environment.ContentRootPath, "App_Data", "instagram-sync.json");

    public TimeSpan Interval => TimeSpan.FromDays(Math.Clamp(config.GetValue("Instagram:SyncIntervalDays", 7.0), 1, 30));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!sync.IsConfigured)
        {
            logger.LogInformation("Instagram sync is off (Instagram:AccessToken is not set)");
            return;
        }

        logger.LogInformation("Instagram sync runs every {Days} days", Interval.TotalDays);
        DateTime? lastFailure = null;

        try
        {
            await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken);
            using var timer = new PeriodicTimer(CheckEvery);
            do
            {
                var now = DateTime.UtcNow;
                if (!IsDue(await ReadLastSuccessAsync(), lastFailure, now, Interval))
                    continue;

                var result = await sync.SyncAsync(stoppingToken);
                if (result.Success)
                {
                    lastFailure = null;
                    await SaveLastSuccessAsync(result.FinishedAt ?? now);
                }
                else
                {
                    lastFailure = now;
                }
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
    }

    /// <summary>Due when there was never a successful sync or the last one is older than the interval,
    /// unless a sync failed within the retry window.</summary>
    public static bool IsDue(DateTime? lastSuccess, DateTime? lastFailure, DateTime now, TimeSpan interval)
    {
        if (lastFailure != null && now - lastFailure < RetryAfterFailure)
            return false;
        return lastSuccess == null || now - lastSuccess >= interval;
    }

    private async Task<DateTime?> ReadLastSuccessAsync()
    {
        // A manual sync from the admin page counts as this week's sync.
        var manual = sync.LastResult is { Success: true, FinishedAt: { } finished } ? finished : (DateTime?)null;
        DateTime? stored = null;
        try
        {
            if (File.Exists(StatePath))
                stored = JsonSerializer.Deserialize<SyncState>(await File.ReadAllTextAsync(StatePath))?.LastSuccessAt;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not read {Path}; syncing now", StatePath);
        }

        return manual > stored || stored == null ? manual : stored;
    }

    private async Task SaveLastSuccessAsync(DateTime at)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(StatePath)!);
            var temp = StatePath + ".tmp";
            await File.WriteAllTextAsync(temp, JsonSerializer.Serialize(new SyncState(at)));
            File.Move(temp, StatePath, overwrite: true);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not save {Path}", StatePath);
        }
    }

    private sealed record SyncState(DateTime LastSuccessAt);
}
