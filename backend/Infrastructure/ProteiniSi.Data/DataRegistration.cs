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
        services.AddScoped<IAboutCompanyProvider, AboutCompanyProvider>();
        services.AddScoped<ILandingPageProvider, LandingPageProvider>();
        services.AddScoped<IPartnerProvider, PartnerProvider>();
        services.AddScoped<IYouTubeVideoProvider, YouTubeVideoProvider>();
        services.AddScoped<IInstagramPostProvider, InstagramPostProvider>();
        services.AddScoped<IHomeSliderProvider, HomeSliderProvider>();
        services.AddScoped<IPackagingProvider, PackagingProvider>();
        services.AddScoped<IShippingSettingsProvider, ShippingSettingsProvider>();
        services.AddScoped<IDynamicSectionProvider, DynamicSectionProvider>();
        services.AddScoped<ITaxonomyProvider, TaxonomyProvider>();
        services.AddScoped<IMarketingProvider, MarketingProvider>();
        services.AddScoped<IFavoriteProvider, FavoriteProvider>();
        services.AddScoped<IGiftVoucherProvider, GiftVoucherProvider>();
        services.AddScoped<ICartProvider, CartProvider>();
        services.AddScoped<IPromotionProvider, PromotionProvider>();
        services.AddScoped<IUserProvider, UserProvider>();
        services.AddScoped<ILoyaltyProvider, LoyaltyProvider>();
        services.AddScoped<IRelatedProductProvider, RelatedProductProvider>();
        services.AddScoped<IProductProvider, ProductProvider>();
        services.AddScoped<IProductVariantProvider, ProductVariantProvider>();
        services.AddScoped<IOrderProvider, OrderProvider>();

        return services;
    }
}
