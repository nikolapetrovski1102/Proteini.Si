using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

namespace ProteiniSi.Api.Extensions;

/// <summary>Per-IP limits on order creation, guest code emails and passwordless/social sign-in, so one visitor cannot flood the shop.</summary>
public static class CheckoutAbuseExtensions
{
    public const string OrderCreatePolicy = "order-create";
    public const string GuestCodePolicy = "guest-checkout-code";
    public const string SignInPolicy = "sign-in";
    public const string AnalyticsPolicy = "analytics";

    public static IServiceCollection AddCheckoutAbuseProtection(this IServiceCollection services)
    {
        // nginx on the same host forwards the visitor's IP; loopback is trusted by default.
        services.Configure<ForwardedHeadersOptions>(options => options.ForwardedHeaders = ForwardedHeaders.XForwardedFor);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    status = false,
                    message = "Too many requests. Please wait a while and try again."
                }, cancellationToken);
            };

            options.AddPolicy(OrderCreatePolicy, context => PerIp(context, permits: 10, window: TimeSpan.FromHours(1)));
            options.AddPolicy(GuestCodePolicy, context => PerIp(context, permits: 10, window: TimeSpan.FromMinutes(15)));
            options.AddPolicy(SignInPolicy, context => PerIp(context, permits: 30, window: TimeSpan.FromMinutes(15)));
            options.AddPolicy(AnalyticsPolicy, context => PerIp(context, permits: 120, window: TimeSpan.FromMinutes(1)));
        });

        return services;
    }

    private static RateLimitPartition<string> PerIp(HttpContext context, int permits, TimeSpan window) =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = permits, Window = window, QueueLimit = 0 });
}
