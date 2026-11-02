using ProteiniSi.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ProteiniSi.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddControllersWithViews();
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<CPayService>();
builder.Services.AddScoped<RelatedProductService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("http://localhost:6800") });
builder.WebHost.ConfigureKestrel(options =>
{
    // HTTP
    options.ListenAnyIP(6800); // Use this port for LAN HTTP access

    //HTTPS(optional, will require dev certificate)
    //options.ListenAnyIP(5175, listenOptions =>
    //{
    //    listenOptions.UseHttps();
    //});
});

// 🔐 Antiforgery service
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
});

// ✅ Add CORS policy
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray()
    ?? new[] { "https://proteini.mk", "https://www.proteini.mk" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Storefront", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader();

        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
                Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                && (uri.Host == "localhost" || uri.Host == "127.0.0.1"));
        }
    });
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdmin", policy =>
        policy.RequireAssertion(context =>
        {
            var value = context.User.FindFirst("superAdmin")?.Value;
            return string.Equals(value, "true", StringComparison.OrdinalIgnoreCase)
                || value == "1";
        }));
});

// Swagger + Mail + JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<MailModel>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddSingleton(resolver => resolver.GetRequiredService<IOptions<MailModel>>().Value);
builder.Services.AddScoped<ILoyaltyService, LoyaltyService>();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Proteini.si API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
    });
});

string? tokenKeyString = builder.Configuration.GetSection("AppSettings:TokenKey").Value
    ?? throw new ArgumentNullException("AppSettings:TokenKey", "JWT Token Key is not configured");

var tokenKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKeyString));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = tokenKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Proteini.si API v1");
        options.ConfigObject.AdditionalItems["persistAuthorization"] = true;
    });
}
else
{
    //app.UseHttpsRedirection();
}

app.UseStaticFiles();

app.UseRouting();

// ✅ Use CORS before authentication/authorization
app.UseCors("Storefront");

app.UseAuthentication();
app.UseAuthorization();

// 🔐 Must be AFTER routing/auth and BEFORE endpoints
app.UseAntiforgery();

// Endpoints LAST
app.MapControllers();
app.MapGet("/", () => Results.Ok("Proteini.si API is running"));
app.Run();
