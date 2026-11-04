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
        services.AddScoped<IAboutCompanyService, AboutCompanyService>();
        services.AddScoped<ILandingPageService, LandingPageService>();
        services.AddScoped<IPartnerService, PartnerService>();
        services.AddScoped<IYouTubeVideoService, YouTubeVideoService>();
        services.AddScoped<IInstagramPostService, InstagramPostService>();
        services.AddScoped<IHomeSliderService, HomeSliderService>();
        services.AddScoped<IPackagingService, PackagingService>();
        services.AddScoped<ICommerceSettingsService, CommerceSettingsService>();
        services.AddScoped<IDynamicContentService, DynamicContentService>();
        services.AddScoped<ITaxonomyService, TaxonomyService>();
        services.AddScoped<IMarketingService, MarketingService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IGiftVoucherService, GiftVoucherService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IPromotionService, PromotionService>();
        services.AddScoped<IEmailSender, EmailSender>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ILoyaltyService, LoyaltyService>();
        services.AddScoped<IRelatedProductService, RelatedProductService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IProductVariantService, ProductVariantService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IOrderEmailService, OrderEmailService>();
        services.AddScoped<ICPayService, CPayService>();

        return services;
    }
}
