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

    public static WebApplication UseCachedStaticFiles(this WebApplication app)
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = context =>
            {
                var isUpload = context.Context.Request.Path.StartsWithSegments("/uploads");
                var maxAge = isUpload ? TimeSpan.FromDays(365) : TimeSpan.FromDays(1);
                context.Context.Response.Headers[HeaderNames.CacheControl] = $"public,max-age={(int)maxAge.TotalSeconds}";
            }
        });

        return app;
    }
}
