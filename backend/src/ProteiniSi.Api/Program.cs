using Microsoft.Extensions.Options;
using ProteiniSi.Api.Extensions;
using ProteiniSi.Api.Middleware;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Services;
using ProteiniSi.Data;
using ProteiniSi.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) => configuration.ReadFrom.Configuration(context.Configuration));
builder.WebHost.ConfigureKestrel(options => options.ListenAnyIP(6800));

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");

builder.Services.AddResponsePerformance();
builder.Services.AddStorefrontCors(builder.Configuration, builder.Environment);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApiDocumentation();

builder.Services.AddDataAccess();
builder.Services.AddApplicationServices();

builder.Services.Configure<MailModel>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddSingleton(provider => provider.GetRequiredService<IOptions<MailModel>>().Value);
builder.Services.AddScoped<ILoyaltyService, LoyaltyService>();
builder.Services.AddScoped<CPayService>();
builder.Services.AddScoped<RelatedProductService>();

var app = builder.Build();

app.UseResponseCompression();
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
    app.UseApiDocumentation();

app.UseCachedStaticFiles();
app.UseRouting();
app.UseCors(SecurityExtensions.StorefrontCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseOutputCache();
app.UseAntiforgery();

app.MapControllers();
app.MapGet("/", () => Results.Ok("Proteini.si API is running"));

app.Run();
