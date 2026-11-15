using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ProteiniSi.Services.Instagram;

/// <summary>
/// Keeps the Instagram access token alive. The token from config ("Instagram:AccessToken") is the
/// seed; long-lived tokens expire after 60 days, so each refreshed token is kept in
/// App_Data/instagram-token.json (outside wwwroot, never published). Pasting a new token in config
/// replaces the stored one.
/// </summary>
public class InstagramTokenStore(IConfiguration config, IWebHostEnvironment environment, ILogger<InstagramTokenStore> logger)
{
    private readonly SemaphoreSlim _lock = new(1, 1);

    private string? ConfigToken => config["Instagram:AccessToken"]?.Trim() is { Length: > 0 } token ? token : null;
    private string FilePath => Path.Combine(environment.ContentRootPath, "App_Data", "instagram-token.json");

    public bool HasToken => ConfigToken != null;

    public async Task<string?> GetAsync()
    {
        var seed = ConfigToken;
        if (seed == null)
            return null;

        var stored = await ReadAsync();
        return stored != null && stored.SeedHash == Hash(seed) ? stored.Token : seed;
    }

    /// <summary>Swaps in a refreshed token. Instagram only refreshes tokens older than 24 hours.</summary>
    public async Task SaveRefreshedAsync(string token)
    {
        var seed = ConfigToken;
        if (seed == null)
            return;

        await _lock.WaitAsync();
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(FilePath)!);
            var json = JsonSerializer.Serialize(new StoredToken(Hash(seed), token, DateTime.UtcNow));
            var temp = FilePath + ".tmp";
            await File.WriteAllTextAsync(temp, json);
            File.Move(temp, FilePath, overwrite: true);
            if (!OperatingSystem.IsWindows())
                File.SetUnixFileMode(FilePath, UnixFileMode.UserRead | UnixFileMode.UserWrite);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<DateTime?> LastRefreshedAtAsync()
    {
        var seed = ConfigToken;
        var stored = await ReadAsync();
        return seed != null && stored?.SeedHash == Hash(seed) ? stored.RefreshedAt : null;
    }

    private async Task<StoredToken?> ReadAsync()
    {
        try
        {
            if (!File.Exists(FilePath))
                return null;
            return JsonSerializer.Deserialize<StoredToken>(await File.ReadAllTextAsync(FilePath));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not read the stored Instagram token; using the configured one");
            return null;
        }
    }

    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private sealed record StoredToken(string SeedHash, string Token, DateTime RefreshedAt);
}
