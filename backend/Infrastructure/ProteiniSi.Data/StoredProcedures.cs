namespace ProteiniSi.Data;

public static class StoredProcedures
{
    public static class BranchLocations
    {
        public const string GetActive = "dbo.usp_BranchLocation_GetActive";
        public const string GetAll = "dbo.usp_BranchLocation_GetAll";
        public const string Create = "dbo.usp_BranchLocation_Create";
        public const string Update = "dbo.usp_BranchLocation_Update";
        public const string Delete = "dbo.usp_BranchLocation_Delete";
    }

    public static class TipArticles
    {
        public const string GetActive = "dbo.usp_TipArticle_GetActive";
        public const string GetAll = "dbo.usp_TipArticle_GetAll";
        public const string GetById = "dbo.usp_TipArticle_GetById";
        public const string GetActiveBySlug = "dbo.usp_TipArticle_GetActiveBySlug";
        public const string SlugExists = "dbo.usp_TipArticle_SlugExists";
        public const string Create = "dbo.usp_TipArticle_Create";
        public const string Update = "dbo.usp_TipArticle_Update";
        public const string Delete = "dbo.usp_TipArticle_Delete";
    }

    public static class HomepageCards
    {
        public const string GetActive = "dbo.usp_HomepageCard_GetActive";
        public const string GetAll = "dbo.usp_HomepageCard_GetAll";
        public const string GetById = "dbo.usp_HomepageCard_GetById";
        public const string SlugExists = "dbo.usp_HomepageCard_SlugExists";
        public const string Create = "dbo.usp_HomepageCard_Create";
        public const string Update = "dbo.usp_HomepageCard_Update";
        public const string Delete = "dbo.usp_HomepageCard_Delete";
    }

    public static class AboutCompany
    {
        public const string GetActive = "dbo.usp_AboutCompanySection_GetActive";
        public const string GetAll = "dbo.usp_AboutCompanySection_GetAll";
        public const string GetById = "dbo.usp_AboutCompanySection_GetById";
        public const string Create = "dbo.usp_AboutCompanySection_Create";
        public const string Update = "dbo.usp_AboutCompanySection_Update";
        public const string Delete = "dbo.usp_AboutCompanySection_Delete";
        public const string Reorder = "dbo.usp_AboutCompanySection_Reorder";
    }

    public static class LandingPage
    {
        public const string GetActive = "dbo.usp_LandingPageSection_GetActive";
        public const string GetAll = "dbo.usp_LandingPageSection_GetAll";
        public const string GetById = "dbo.usp_LandingPageSection_GetById";
        public const string Create = "dbo.usp_LandingPageSection_Create";
        public const string Update = "dbo.usp_LandingPageSection_Update";
        public const string Delete = "dbo.usp_LandingPageSection_Delete";
        public const string Reorder = "dbo.usp_LandingPageSection_Reorder";
    }

    public static class Partners
    {
        public const string GetActive = "dbo.usp_Partner_GetActive";
        public const string GetAll = "dbo.usp_Partner_GetAll";
        public const string GetActiveByType = "dbo.usp_Partner_GetActiveByType";
        public const string GetById = "dbo.usp_Partner_GetById";
        public const string Create = "dbo.usp_Partner_Create";
        public const string Update = "dbo.usp_Partner_Update";
        public const string Delete = "dbo.usp_Partner_Delete";
        public const string Reorder = "dbo.usp_Partner_Reorder";
    }

    public static class YouTubeVideos
    {
        public const string GetActive = "dbo.usp_YouTubeVideo_GetActive";
        public const string GetAll = "dbo.usp_YouTubeVideo_GetAll";
        public const string GetById = "dbo.usp_YouTubeVideo_GetById";
        public const string Create = "dbo.usp_YouTubeVideo_Create";
        public const string Update = "dbo.usp_YouTubeVideo_Update";
        public const string Deactivate = "dbo.usp_YouTubeVideo_Deactivate";
        public const string Reorder = "dbo.usp_YouTubeVideo_Reorder";
    }

    public static class InstagramPosts
    {
        public const string GetActive = "dbo.usp_InstagramPost_GetActive";
        public const string GetActiveById = "dbo.usp_InstagramPost_GetActiveById";
        public const string Create = "dbo.usp_InstagramPost_Create";
        public const string Update = "dbo.usp_InstagramPost_Update";
        public const string Deactivate = "dbo.usp_InstagramPost_Deactivate";
    }

    public static class HomeSlider
    {
        public const string GetActive = "dbo.usp_HomeSlider_GetActive";
        public const string GetAll = "dbo.usp_HomeSlider_GetAll";
        public const string GetById = "dbo.usp_HomeSlider_GetById";
        public const string Create = "dbo.usp_HomeSlider_Create";
        public const string Update = "dbo.usp_HomeSlider_Update";
        public const string Delete = "dbo.usp_HomeSlider_Delete";
        public const string Reorder = "dbo.usp_HomeSlider_Reorder";
    }

    public static class Packaging
    {
        public const string GetActive = "dbo.usp_Packaging_GetActive";
        public const string GetActiveById = "dbo.usp_Packaging_GetActiveById";
        public const string Create = "dbo.usp_Packaging_Create";
        public const string Update = "dbo.usp_Packaging_Update";
        public const string Deactivate = "dbo.usp_Packaging_Deactivate";
    }

    public static class CommerceSettings
    {
        public const string GetShipping = "dbo.usp_ShippingSettings_Get";
        public const string UpdateShipping = "dbo.usp_ShippingSettings_Update";
    }

    public static class DynamicContent
    {
        public const string GetActiveByPage = "dbo.usp_DynamicSection_GetActiveByPage";
        public const string GetAllByPage = "dbo.usp_DynamicSection_GetAllByPage";
        public const string GetById = "dbo.usp_DynamicSection_GetById";
        public const string Create = "dbo.usp_DynamicSection_Create";
        public const string Update = "dbo.usp_DynamicSection_Update";
        public const string Delete = "dbo.usp_DynamicSection_Delete";
        public const string Reorder = "dbo.usp_DynamicSection_Reorder";
    }

    public static class Taxonomy
    {
        public const string GetCategories = "dbo.usp_ProductCategory_GetAll";
        public const string CreateCategory = "dbo.usp_ProductCategory_Create";
        public const string UpdateCategory = "dbo.usp_ProductCategory_Update";
        public const string DeleteCategory = "dbo.usp_ProductCategory_Delete";
        public const string ResolveCategorySlug = "dbo.usp_CategorySlugHistory_Resolve";
    }

    public static class Marketing
    {
        public const string Subscribe = "dbo.usp_NewsletterSubscriber_Subscribe";
        public const string Unsubscribe = "dbo.usp_NewsletterSubscriber_Unsubscribe";
        public const string GetSubscribersPaged = "dbo.usp_NewsletterSubscriber_GetPaged";
        public const string GetAllSubscribers = "dbo.usp_NewsletterSubscriber_GetAll";
        public const string UpdateSubscriberStatus = "dbo.usp_NewsletterSubscriber_UpdateStatus";
        public const string GetUsersPaged = "dbo.usp_MarketingUser_GetPaged";
        public const string GetAllUsers = "dbo.usp_MarketingUser_GetAll";
    }

    public static class Favorites
    {
        public const string Add = "dbo.usp_FavoriteProduct_Add";
        public const string Remove = "dbo.usp_FavoriteProduct_Remove";
        public const string GetByUser = "dbo.usp_FavoriteProduct_GetByUser";
        public const string Exists = "dbo.usp_FavoriteProduct_Exists";
        public const string CountByProduct = "dbo.usp_FavoriteProduct_CountByProduct";
    }

    public static class GiftVouchers
    {
        public const string GetByCode = "dbo.usp_GiftVoucher_GetByCode";
        public const string GetPaged = "dbo.usp_GiftVoucher_GetPaged";
        public const string UpdateStatus = "dbo.usp_GiftVoucher_UpdateStatus";
        public const string GetReport = "dbo.usp_GiftVoucher_GetReport";
    }

    public static class Cart
    {
        public const string GetByUser = "dbo.usp_Cart_GetByUser";
        public const string GetOrCreate = "dbo.usp_ShoppingCart_GetOrCreate";
        public const string GetProductForAdd = "dbo.usp_Cart_GetProductForAdd";
        public const string AddItem = "dbo.usp_CartItem_Add";
        public const string UpdateItemQuantity = "dbo.usp_CartItem_UpdateQuantity";
        public const string RemoveItem = "dbo.usp_CartItem_Remove";
        public const string Clear = "dbo.usp_Cart_Clear";
    }

    public static class Promotions
    {
        public const string GetActiveFreeGifts = "dbo.usp_FreeGift_GetActive";
        public const string GetFreeGifts = "dbo.usp_FreeGift_GetAll";
        public const string CreateFreeGift = "dbo.usp_FreeGift_Create";
        public const string UpdateFreeGift = "dbo.usp_FreeGift_Update";
        public const string DeleteFreeGift = "dbo.usp_FreeGift_Delete";
        public const string GetCodeForValidation = "dbo.usp_PromoCode_GetForValidation";
        public const string GetCodes = "dbo.usp_PromoCode_GetAll";
        public const string CreateCode = "dbo.usp_PromoCode_Create";
        public const string UpdateCode = "dbo.usp_PromoCode_Update";
        public const string DeleteCode = "dbo.usp_PromoCode_Delete";
        public const string GetUsageReport = "dbo.usp_PromoCodeUsage_GetReport";
    }

    public static class Users
    {
        public const string GetById = "dbo.usp_User_GetById";
        public const string GetByEmail = "dbo.usp_User_GetByEmail";
        public const string EmailExists = "dbo.usp_User_EmailExists";
        public const string GetIdByEmail = "dbo.usp_User_GetIdByEmail";
        public const string Register = "dbo.usp_User_Register";
        public const string SetResetToken = "dbo.usp_User_SetResetToken";
        public const string GetResetToken = "dbo.usp_User_GetResetToken";
        public const string ResetPassword = "dbo.usp_User_ResetPassword";
        public const string UpdateBillingInfo = "dbo.usp_User_UpdateBillingInfo";
        public const string SetEmailCode = "dbo.usp_User_SetEmailCode";
        public const string GetEmailCode = "dbo.usp_User_GetEmailCode";
        public const string IncrementEmailCodeAttempts = "dbo.usp_User_IncrementEmailCodeAttempts";
        public const string ConfirmEmail = "dbo.usp_User_ConfirmEmail";
    }

    public static class Loyalty
    {
        public const string GetSummary = "dbo.usp_LoyaltyPoints_GetSummary";
        public const string GetHistory = "dbo.usp_LoyaltyPoints_GetHistory";
        public const string GetAvailable = "dbo.usp_LoyaltyPoints_GetAvailable";
    }

    public static class Products
    {
        public const string GetRelated = "dbo.usp_Product_GetRelated";
        public const string Search = "dbo.usp_Product_Search";
        public const string GetAll = "dbo.usp_Product_GetAll";
        public const string GetFilterOptions = "dbo.usp_Product_GetFilterOptions";
        public const string GetCategoryTree = "dbo.usp_Product_GetCategoryTree";
        public const string Filter = "dbo.usp_Product_Filter";
        public const string GetById = "dbo.usp_Product_GetById";
        public const string Exists = "dbo.usp_Product_Exists";
        public const string Create = "dbo.usp_Product_Create";
        public const string Update = "dbo.usp_Product_Update";
        public const string Delete = "dbo.usp_Product_Delete";
        public const string SetImage = "dbo.usp_Product_SetImage";
        public const string BulkSetQuantity = "dbo.usp_Product_BulkSetQuantity";
        public const string BulkApplyDiscount = "dbo.usp_Product_BulkApplyDiscount";
        public const string BulkRemoveDiscount = "dbo.usp_Product_BulkRemoveDiscount";
    }

    public static class ProductGallery
    {
        public const string GetByProduct = "dbo.usp_ProductGallery_GetByProduct";
        public const string Create = "dbo.usp_ProductGallery_Create";
        public const string Delete = "dbo.usp_ProductGallery_Delete";
        public const string Reorder = "dbo.usp_ProductGallery_Reorder";
        public const string SetMain = "dbo.usp_ProductGallery_SetMain";
    }

    public static class ProductVariants
    {
        public const string GetByProduct = "dbo.usp_ProductVariants_GetByProduct";
        public const string GetActiveById = "dbo.usp_ProductVariants_GetActiveById";
        public const string GetWithParent = "dbo.usp_ProductVariants_GetWithParent";
        public const string GetParentProduct = "dbo.usp_ProductVariants_GetParentProduct";
        public const string ExistsActive = "dbo.usp_ProductVariants_ExistsActive";
        public const string Create = "dbo.usp_ProductVariants_Create";
        public const string Update = "dbo.usp_ProductVariants_Update";
        public const string Delete = "dbo.usp_ProductVariants_Delete";
        public const string SetNutritionTable = "dbo.usp_ProductVariants_SetNutritionTable";
        public const string GetNutritionTable = "dbo.usp_ProductVariants_GetNutritionTable";
    }

    public static class VariantGallery
    {
        public const string GetByVariant = "dbo.usp_VariantGallery_GetByVariant";
        public const string Create = "dbo.usp_VariantGallery_Create";
        public const string Delete = "dbo.usp_VariantGallery_Delete";
        public const string SetMain = "dbo.usp_VariantGallery_SetMain";
    }

    public static class VariantNutrition
    {
        public const string Get = "dbo.usp_VariantNutrition_Get";
        public const string Save = "dbo.usp_VariantNutrition_Save";
        public const string Delete = "dbo.usp_VariantNutrition_Delete";
    }

    public static class Orders
    {
        public const string AdminExport = "dbo.usp_Order_AdminExport";
        public const string AdminList = "dbo.usp_Order_AdminList";
        public const string Cancel = "dbo.usp_Order_Cancel";
        public const string CompletePayment = "dbo.usp_Order_CompletePayment";
        public const string Create = "dbo.usp_Order_Create";
        public const string DocumentExists = "dbo.usp_Order_DocumentExists";
        public const string Exists = "dbo.usp_Order_Exists";
        public const string GetAdminDetails = "dbo.usp_Order_GetAdminDetails";
        public const string GetBillingPhone = "dbo.usp_Order_GetBillingPhone";
        public const string GetCancelInfo = "dbo.usp_Order_GetCancelInfo";
        public const string GetCartId = "dbo.usp_Order_GetCartId";
        public const string GetCartItems = "dbo.usp_Order_GetCartItems";
        public const string GetCheckoutUser = "dbo.usp_Order_GetCheckoutUser";
        public const string GetConfirmation = "dbo.usp_Order_GetConfirmation";
        public const string GetDocumentSource = "dbo.usp_Order_GetDocumentSource";
        public const string GetEmailData = "dbo.usp_Order_GetEmailData";
        public const string GetEmailDebugData = "dbo.usp_Order_GetEmailDebugData";
        public const string GetForAdminStatus = "dbo.usp_Order_GetForAdminStatus";
        public const string GetFreeGift = "dbo.usp_Order_GetFreeGift";
        public const string GetGuestProduct = "dbo.usp_Order_GetGuestProduct";
        public const string GetHistory = "dbo.usp_Order_GetHistory";
        public const string GetIssuedVouchers = "dbo.usp_Order_GetIssuedVouchers";
        public const string GetLast = "dbo.usp_Order_GetLast";
        public const string GetLatestDocument = "dbo.usp_Order_GetLatestDocument";
        public const string GetPromotion = "dbo.usp_Order_GetPromotion";
        public const string MarkPaymentFailed = "dbo.usp_Order_MarkPaymentFailed";
        public const string RegisterDocument = "dbo.usp_Order_RegisterDocument";
        public const string ReleaseVoucher = "dbo.usp_Order_ReleaseVoucher";
        public const string UpdateAdminStatus = "dbo.usp_Order_UpdateAdminStatus";
    }
}
