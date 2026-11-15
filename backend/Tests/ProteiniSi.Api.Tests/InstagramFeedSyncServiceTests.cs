using System.Net;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Instagram;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class InstagramFeedSyncServiceTests : IDisposable
{
    private readonly string _root = Directory.CreateTempSubdirectory("ig-sync-").FullName;

    public void Dispose() => Directory.Delete(_root, recursive: true);

    [Theory]
    [InlineData("https://www.instagram.com/p/DBowZDzsPCh/?utm_source=ig_web_copy_link", "DBowZDzsPCh")]
    [InlineData("https://www.instagram.com/reel/DMdQ5OlMhjy/", "DMdQ5OlMhjy")]
    [InlineData("https://www.instagram.com/proteini.si_makedonija/p/Ab_c-1/", "Ab_c-1")]
    [InlineData("https://www.instagram.com/proteini.si_makedonija/", null)]
    public void ShortCodeOf_reads_post_and_reel_links(string url, string? expected) =>
        Assert.Equal(expected, InstagramFeedSyncService.ShortCodeOf(url));

    [Fact]
    public void ParseTimestamp_accepts_offsets_without_a_colon() =>
        Assert.Equal(new DateTime(2025, 10, 27, 8, 15, 0, DateTimeKind.Utc),
            InstagramFeedSyncService.ParseTimestamp("2025-10-27T10:15:00+0200"));

    [Fact]
    public async Task Sync_downloads_each_picture_once_and_upserts_posts()
    {
        var handler = new FakeInstagram(uri => uri.AbsolutePath switch
        {
            "/refresh_access_token" => (HttpStatusCode.OK, "application/json", """{"access_token":"fresh","expires_in":5184000}"""),
            "/me/media" => (HttpStatusCode.OK, "application/json", """
                {"data":[
                  {"id":"1","caption":"Rebel","media_type":"IMAGE","media_url":"https://cdn.test/a.jpg",
                   "permalink":"https://www.instagram.com/p/AAA111/","timestamp":"2025-10-27T10:15:00+0000","like_count":20,"username":"shop"},
                  {"id":"2","media_type":"VIDEO","media_url":"https://cdn.test/v.mp4","thumbnail_url":"https://cdn.test/v.jpg",
                   "permalink":"https://www.instagram.com/reel/BBB222/","timestamp":"2025-10-20T10:15:00+0000","username":"shop"}
                ]}
                """),
            "/a.jpg" or "/v.jpg" => (HttpStatusCode.OK, "image/jpeg", "jpegbytes"),
            _ => (HttpStatusCode.NotFound, "text/plain", ""),
        });
        var provider = new FakeProvider();
        var service = CreateService(handler, provider, token: "seed");

        var first = await service.SyncAsync();

        Assert.True(first.Success, first.Error);
        Assert.Equal((2, 2, 0, 2), (first.Fetched, first.Added, first.Updated, first.ImagesDownloaded));
        Assert.Contains(handler.Calls, u => u.AbsolutePath == "/v.jpg"); // video uses its thumbnail
        Assert.DoesNotContain(handler.Calls, u => u.AbsolutePath == "/v.mp4");
        Assert.True(File.Exists(Path.Combine(_root, "wwwroot", "uploads", "instagram", "instagram_AAA111.jpg")));

        var post = provider.Upserts[0];
        Assert.Equal(("AAA111", "/uploads/instagram/instagram_AAA111.jpg", 20, "shop"),
            (post.ShortCode, post.ImagePath, post.LikeCount, post.PostedBy));
        Assert.Null(provider.Upserts[1].LikeCount); // hidden like counts keep the stored value

        // The refreshed token is used from now on.
        Assert.Equal("fresh", handler.Tokens[handler.Calls.FindIndex(u => u.AbsolutePath == "/me/media")]);

        handler.Calls.Clear();
        handler.Tokens.Clear();
        var second = await service.SyncAsync();
        Assert.Equal((0, 2, 0), (second.ImagesDownloaded, second.Updated, second.Added));
        Assert.DoesNotContain(handler.Calls, u => u.Host == "cdn.test");
        Assert.DoesNotContain(handler.Calls, u => u.AbsolutePath == "/refresh_access_token"); // refreshed < 1 day ago
    }

    [Fact]
    public async Task Sync_reports_api_errors_without_throwing()
    {
        var handler = new FakeInstagram(uri => uri.AbsolutePath == "/me/media"
            ? (HttpStatusCode.BadRequest, "application/json", """{"error":{"message":"Invalid OAuth access token"}}""")
            : (HttpStatusCode.BadRequest, "application/json", "{}"));
        var service = CreateService(handler, new FakeProvider(), token: "bad");

        var result = await service.SyncAsync();

        Assert.False(result.Success);
        Assert.Contains("Invalid OAuth access token", result.Error);
    }

    [Fact]
    public async Task Sync_is_off_without_a_token()
    {
        var service = CreateService(new FakeInstagram(_ => throw new InvalidOperationException()), new FakeProvider(), token: null);
        Assert.False(service.IsConfigured);
        Assert.False((await service.SyncAsync()).Configured);
    }

    [Theory]
    [InlineData(null, null, true)]      // never synced
    [InlineData(6.9, null, false)]      // synced this week
    [InlineData(7.0, null, true)]       // a week ago
    [InlineData(10.0, 0.1, false)]      // overdue, but just failed: wait before retrying
    [InlineData(10.0, 0.3, true)]       // overdue, failure 7+ hours ago: retry
    public void Worker_syncs_weekly_and_retries_failures_after_a_pause(
        double? daysSinceSuccess, double? daysSinceFailure, bool expected)
    {
        var now = new DateTime(2026, 11, 15, 12, 0, 0, DateTimeKind.Utc);
        Assert.Equal(expected, InstagramSyncWorker.IsDue(
            daysSinceSuccess is { } s ? now.AddDays(-s) : null,
            daysSinceFailure is { } f ? now.AddDays(-f) : null,
            now, TimeSpan.FromDays(7)));
    }

    [Fact]
    public async Task Sync_with_a_Facebook_token_finds_the_account_through_the_Page_and_never_refreshes()
    {
        var handler = new FakeInstagram(uri => (uri.Host, uri.AbsolutePath) switch
        {
            ("graph.facebook.com", "/v23.0/me/accounts") => (HttpStatusCode.OK, "application/json",
                """{"data":[{"id":"1","name":"Other"},{"id":"2","name":"Shop","instagram_business_account":{"id":"1784"}}]}"""),
            ("graph.facebook.com", "/v23.0/1784/media") => (HttpStatusCode.OK, "application/json", """
                {"data":[{"id":"1","caption":"Hi","media_type":"IMAGE","media_url":"https://cdn.test/a.jpg",
                  "permalink":"https://www.instagram.com/p/AAA111/","timestamp":"2025-10-27T10:15:00+0000","like_count":3}]}
                """),
            ("cdn.test", _) => (HttpStatusCode.OK, "image/jpeg", "jpegbytes"),
            _ => (HttpStatusCode.NotFound, "text/plain", ""),
        });
        var service = CreateService(handler, new FakeProvider(), token: "EAAsystem");

        var result = await service.SyncAsync();

        Assert.True(result.Success, result.Error);
        Assert.Equal((1, 1), (result.Fetched, result.Added));
        Assert.DoesNotContain(handler.Calls, u => u.Host == "graph.instagram.com");
        Assert.Equal("EAAsystem", handler.Tokens[handler.Calls.FindIndex(u => u.AbsolutePath.EndsWith("/media"))]);
    }

    private InstagramFeedSyncService CreateService(FakeInstagram handler, FakeProvider provider, string? token)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Instagram:AccessToken"] = token })
            .Build();
        var env = new FakeEnv(_root);
        var services = new ServiceCollection().AddSingleton<IInstagramPostProvider>(provider).BuildServiceProvider();
        return new InstagramFeedSyncService(
            new FakeClientFactory(handler),
            services.GetRequiredService<IServiceScopeFactory>(),
            new LocalStorage(Path.Combine(_root, "wwwroot")),
            new InstagramTokenStore(config, env, NullLogger<InstagramTokenStore>.Instance),
            config,
            NullLogger<InstagramFeedSyncService>.Instance);
    }

    private sealed class FakeInstagram(Func<Uri, (HttpStatusCode, string, string)> respond) : HttpMessageHandler
    {
        public readonly List<Uri> Calls = [];
        public readonly List<string?> Tokens = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Calls.Add(request.RequestUri!);
            Tokens.Add(request.Headers.Authorization?.Parameter);
            var (status, type, body) = respond(request.RequestUri!);
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, type) });
        }
    }

    private sealed class FakeClientFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed class FakeProvider : IInstagramPostProvider
    {
        private readonly HashSet<string> _known = [];
        public readonly List<InstagramFeedPostDto> Upserts = [];

        public Task<InstagramUpsertResult> UpsertFromFeedAsync(InstagramFeedPostDto post)
        {
            Upserts.Add(post);
            return Task.FromResult(new InstagramUpsertResult { Id = Upserts.Count, Inserted = _known.Add(post.ShortCode) });
        }

        public Task<List<InstagramPost>> GetActiveAsync() => throw new NotImplementedException();
        public Task<InstagramPost?> GetActiveByIdAsync(int id) => throw new NotImplementedException();
        public Task<int> CreateAsync(CreateInstagramPostDto post) => throw new NotImplementedException();
        public Task<bool> UpdateAsync(UpdateInstagramPostDto post) => throw new NotImplementedException();
        public Task<bool> DeactivateAsync(int id) => throw new NotImplementedException();
    }

    private sealed class LocalStorage(string webRoot) : IImageStorageService
    {
        public async Task<string> SaveStreamAsync(Stream content, string webFolder, string fileName, CancellationToken cancellationToken = default)
        {
            Directory.CreateDirectory(Path.Combine(webRoot, webFolder));
            await using var file = File.Create(Path.Combine(webRoot, webFolder, fileName));
            await content.CopyToAsync(file, cancellationToken);
            return $"/{webFolder}/{fileName}";
        }

        public bool Exists(string webPath) => File.Exists(Path.Combine(webRoot, webPath.TrimStart('/')));
        public Task<string?> SaveAsync(IFormFile? image, string folder, string filePrefix) => throw new NotImplementedException();
        public Task<string> SaveFileAsync(IFormFile file, string webFolder, string fileName) => throw new NotImplementedException();
        public void Delete(string? webPath) => throw new NotImplementedException();
    }

    private sealed class FakeEnv(string root) : IWebHostEnvironment
    {
        public string ContentRootPath { get; set; } = root;
        public string WebRootPath { get; set; } = Path.Combine(root, "wwwroot");
        public string EnvironmentName { get; set; } = "Test";
        public string ApplicationName { get; set; } = "Test";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
