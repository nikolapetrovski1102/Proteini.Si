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

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IBranchLocationService, BranchLocationService>();

        return services;
    }
}
