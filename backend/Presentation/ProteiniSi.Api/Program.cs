using ProteiniSi.Api.Extensions;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Data;
using ProteiniSi.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration));
// Loopback only: nginx on the same host is the sole client, so the API is never reachable from outside
// even if the firewall is off.
builder.WebHost.ConfigureKestrel(options => options.ListenLocalhost(builder.Configuration.GetValue("ApiPort", 6800)));

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");

builder.Services.AddResponsePerformance();
builder.Services.AddStorefrontCors(builder.Configuration, builder.Environment);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApiDocumentation();
builder.Services.AddCheckoutAbuseProtection();

builder.Services.AddDataAccess();
builder.Services.AddApplicationServices();
ProteiniSi.Services.Helpers.EmailLayout.Configure(builder.Configuration["AppSettings:FrontendUrl"]);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseResponseCompression();
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
    app.UseApiDocumentation();

app.UseCachedStaticFiles();
app.UseRouting();
app.UseCors(SecurityExtensions.StorefrontCorsPolicy);
app.UseMiddleware<ClientKeyMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();
app.UseAntiforgery();

app.MapControllers();
app.MapGet("/", () => Results.Ok("Proteini.si API is running"));

app.Run();
