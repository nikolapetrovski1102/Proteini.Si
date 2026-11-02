using Microsoft.Extensions.DependencyInjection;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Data.Providers;

namespace ProteiniSi.Data;

public static class DataRegistration
{
    public static IServiceCollection AddDataAccess(this IServiceCollection services)
    {
        services.AddSingleton<ISqlHelper, SqlHelper>();

        services.AddScoped<IBranchLocationProvider, BranchLocationProvider>();
        services.AddScoped<ITipArticleProvider, TipArticleProvider>();
        services.AddScoped<IHomepageCardProvider, HomepageCardProvider>();

        return services;
    }
}
