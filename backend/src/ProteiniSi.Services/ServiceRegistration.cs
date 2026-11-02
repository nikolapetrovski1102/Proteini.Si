using Microsoft.Extensions.DependencyInjection;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

public static class ServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddSingleton<IImageStorageService, ImageStorageService>();

        services.AddScoped<IBranchLocationService, BranchLocationService>();
        services.AddScoped<ITipArticleService, TipArticleService>();
        services.AddScoped<IHomepageCardService, HomepageCardService>();

        return services;
    }
}
