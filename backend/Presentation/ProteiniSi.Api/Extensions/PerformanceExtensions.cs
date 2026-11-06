using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Net.Http.Headers;

namespace ProteiniSi.Api.Extensions;

public static class PerformanceExtensions
{
    public static IServiceCollection AddResponsePerformance(this IServiceCollection services)
    {
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
        });
        services.Configure<BrotliCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);
        services.Configure<GzipCompressionProviderOptions>(options => options.Level = CompressionLevel.Fastest);

        services.AddOutputCache(options =>
            options.AddBasePolicy(policy => policy.Expire(TimeSpan.FromMinutes(10))));

        return services;
    }

    // Uploaded image folders. Every upload gets a unique file name, so these files never
    // change in place and can be cached for a year by browsers and the CDN edge.
    private static readonly string[] ImmutableImageFolders =
    [
        "/uploads", "/home-slider", "/product-images", "/product-gallery", "/variant-images", "/variant-gallery"
    ];

    public static WebApplication UseCachedStaticFiles(this WebApplication app)
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = context =>
            {
                var path = context.Context.Request.Path;
                var isImage = ImmutableImageFolders.Any(folder => path.StartsWithSegments(folder));
                context.Context.Response.Headers[HeaderNames.CacheControl] = isImage
                    ? "public,max-age=31536000,immutable"
                    : $"public,max-age={(int)TimeSpan.FromDays(1).TotalSeconds}";
            }
        });

        return app;
    }
}
