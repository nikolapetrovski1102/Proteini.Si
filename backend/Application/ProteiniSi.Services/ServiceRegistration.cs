using Microsoft.Extensions.DependencyInjection;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Services.ExternalAuth;
using ProteiniSi.Services.Instagram;
using ProteiniSi.Services.MetaAds;

namespace ProteiniSi.Services;

public static class ServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddHttpClient(nameof(CloudflareCacheService), client => client.Timeout = TimeSpan.FromSeconds(10));
        services.AddSingleton<ICdnCacheService, CloudflareCacheService>();
        services.AddHttpClient(GoogleIdentityVerifier.HttpClientName, client => client.Timeout = TimeSpan.FromSeconds(10));
        services.AddSingleton<IExternalIdentityVerifier, GoogleIdentityVerifier>();
        services.AddHttpClient(TurnstileVerifier.HttpClientName, client => client.Timeout = TimeSpan.FromSeconds(10));
        services.AddSingleton<ITurnstileVerifier, TurnstileVerifier>();
        services.AddSingleton<IImageStorageService, ImageStorageService>();
        services.AddHttpClient(InstagramFeedSyncService.HttpClientName, client => client.Timeout = TimeSpan.FromSeconds(30));
        services.AddSingleton<InstagramTokenStore>();
        services.AddSingleton<IInstagramFeedSyncService, InstagramFeedSyncService>();
        services.AddHostedService<InstagramSyncWorker>();
        services.AddHostedService<DiscountSyncWorker>();
        services.AddHttpClient(MetaAdsService.HttpClientName, client => client.Timeout = TimeSpan.FromSeconds(60));
        services.AddScoped<IMetaAdsAuthService, MetaAdsAuthService>();
        services.AddScoped<IMetaAdsService, MetaAdsService>();

        services.AddScoped<IBranchLocationService, BranchLocationService>();
        services.AddScoped<ITipArticleService, TipArticleService>();
        services.AddScoped<IHomepageCardService, HomepageCardService>();
        services.AddScoped<IAboutCompanyService, AboutCompanyService>();
        services.AddScoped<ILandingPageService, LandingPageService>();
        services.AddScoped<IPartnerService, PartnerService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IDiscountService, DiscountService>();
        services.AddScoped<IProductPlacementService, ProductPlacementService>();
        services.AddScoped<IYouTubeVideoService, YouTubeVideoService>();
        services.AddScoped<IInstagramPostService, InstagramPostService>();
        services.AddScoped<IHomeSliderService, HomeSliderService>();
        services.AddScoped<IPackagingService, PackagingService>();
        services.AddScoped<ICommerceSettingsService, CommerceSettingsService>();
        services.AddScoped<IHomeShowcaseService, HomeShowcaseService>();
        services.AddScoped<IDynamicContentService, DynamicContentService>();
        services.AddScoped<ITaxonomyService, TaxonomyService>();
        services.AddScoped<IMarketingService, MarketingService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IGiftVoucherService, GiftVoucherService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IPromotionService, PromotionService>();
        services.AddScoped<IAffiliateService, AffiliateService>();
        services.AddScoped<IEmailSender, EmailSender>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ILoyaltyService, LoyaltyService>();
        services.AddScoped<IRelatedProductService, RelatedProductService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IProductFeedService, ProductFeedService>();
        services.AddScoped<IProductVariantService, ProductVariantService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IGuestCheckoutVerificationService, GuestCheckoutVerificationService>();
        services.AddScoped<IOrderEmailService, OrderEmailService>();
        services.AddScoped<IGiftVoucherEmailService, GiftVoucherEmailService>();
        services.AddScoped<ICPayService, CPayService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IMarketingAutomationService, MarketingAutomationService>();
        services.AddScoped<IDailyReportService, DailyReportService>();
        services.AddScoped<IAddressLookupService, AddressLookupService>();

        return services;
    }
}
