using System.Security.Cryptography;
using System.Text;

namespace ProteiniSi.Api.Middleware;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class SkipClientKeyAttribute : Attribute;

public class ClientKeyMiddleware(RequestDelegate next, IConfiguration configuration)
{
    public const string HeaderName = "X-Api-Key";

    private readonly byte[] _expectedKey = Encoding.UTF8.GetBytes(configuration["AppSettings:ClientKey"] ?? "");

    public async Task InvokeAsync(HttpContext context)
    {
        if (_expectedKey.Length == 0 || !RequiresClientKey(context) || HasValidKey(context))
        {
            await next(context);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsJsonAsync(new { message = "Missing or invalid client key." });
    }

    private static bool RequiresClientKey(HttpContext context) =>
        context.Request.Path.StartsWithSegments("/api")
        && !HttpMethods.IsOptions(context.Request.Method)
        && context.GetEndpoint()?.Metadata.GetMetadata<SkipClientKeyAttribute>() is null;

    private bool HasValidKey(HttpContext context)
    {
        var providedKey = Encoding.UTF8.GetBytes(context.Request.Headers[HeaderName].ToString());
        return CryptographicOperations.FixedTimeEquals(providedKey, _expectedKey);
    }
}
