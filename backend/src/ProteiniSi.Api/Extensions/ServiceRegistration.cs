using ProteiniSi.Api.Data;
using ProteiniSi.Api.Providers.Implementation;
using ProteiniSi.Api.Providers.Interfaces;
using ProteiniSi.Api.Services.Implementation;
using ProteiniSi.Api.Services.Interfaces;

namespace ProteiniSi.Api.Extensions;

public static class ServiceRegistration
{
    public static IServiceCollection AddDataAccess(this IServiceCollection services)
    {
        services.AddScoped<ISqlHelper, SqlHelper>();

        services.AddScoped<IBranchLocationProvider, BranchLocationProvider>();
        services.AddScoped<ITipArticleProvider, TipArticleProvider>();
        services.AddScoped<IHomepageCardProvider, HomepageCardProvider>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IImageStorageService, ImageStorageService>();
        services.AddScoped<IBranchLocationService, BranchLocationService>();
        services.AddScoped<ITipArticleService, TipArticleService>();
        services.AddScoped<IHomepageCardService, HomepageCardService>();

        return services;
    }
}
