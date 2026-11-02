using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

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
            });

        services.AddAuthorizationBuilder()
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
