using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Services.MetaAds;

namespace ProteiniSi.Api.Extensions;

public static class SecurityExtensions
{
    public const string StorefrontCorsPolicy = "Storefront";

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var tokenKey = configuration["AppSettings:TokenKey"]
            ?? throw new InvalidOperationException("AppSettings:TokenKey is not configured.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };
            })
            // Meta ads dashboard (meta-ads.proteini.mk): its own token, read from an HttpOnly cookie and re-checked
            // against MetaAds:AllowedUsers on every request, so removing an email locks that person out at once.
            .AddJwtBearer(MetaAdsSession.Scheme, options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(MetaAdsSession.SigningKey(configuration)),
                    ValidIssuer = MetaAdsSession.Issuer,
                    ValidAudience = MetaAdsSession.Audience,
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        context.Token = context.Request.Cookies[MetaAdsSession.CookieName];
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        var auth = context.HttpContext.RequestServices.GetRequiredService<IMetaAdsAuthService>();
                        if (context.Principal is null || auth.GetUser(context.Principal) is null)
                            context.Fail("This email no longer has access.");
                        return Task.CompletedTask;
                    }
                };
            });

        services.AddAuthorizationBuilder()
            .AddPolicy(MetaAdsSession.Policy, policy => policy
                .AddAuthenticationSchemes(MetaAdsSession.Scheme)
                .RequireAuthenticatedUser())
            .AddPolicy("SuperAdmin", policy => policy.RequireAssertion(context =>
            {
                var value = context.User.FindFirst("superAdmin")?.Value;
                return string.Equals(value, "true", StringComparison.OrdinalIgnoreCase) || value == "1";
            }));

        return services;
    }

    public static IServiceCollection AddStorefrontCors(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
            ?? ["https://proteini.mk", "https://www.proteini.mk"];

        services.AddCors(options => options.AddPolicy(StorefrontCorsPolicy, policy =>
        {
            policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader();

            if (environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin =>
                    Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                    && (uri.Host == "localhost" || uri.Host == "127.0.0.1"));
            }
        }));

        return services;
    }
}
