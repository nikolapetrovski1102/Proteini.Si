using ProteiniSi.Contracts.Exceptions;

namespace ProteiniSi.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            logger.LogWarning("{Method} {Path} returned {StatusCode}: {Message}",
                context.Request.Method, context.Request.Path, ex.StatusCode, ex.Message);

            if (ex.Body is null)
                await WriteErrorAsync(context, ex.StatusCode, ex.Message);
            else
                await WriteBodyAsync(context, ex.StatusCode, ex.Body);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled error on {Method} {Path}", context.Request.Method, context.Request.Path);

            await WriteErrorAsync(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, string message)
    {
        if (context.Response.HasStarted)
            return;

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new { status = false, message, traceId = context.TraceIdentifier });
    }

    private static async Task WriteBodyAsync(HttpContext context, int statusCode, object body)
    {
        if (context.Response.HasStarted)
            return;

        context.Response.Clear();
        context.Response.StatusCode = statusCode;

        if (body is string text)
        {
            context.Response.ContentType = "text/plain; charset=utf-8";
            await context.Response.WriteAsync(text);
        }
        else
        {
            await context.Response.WriteAsJsonAsync(body, body.GetType());
        }
    }
}
