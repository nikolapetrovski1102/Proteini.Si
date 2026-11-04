SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Product_Id,
        p.Name,
        p.Img,
        p.Category,
        CASE WHEN p.HasVariants = 1 THEN COALESCE((
            SELECT SUM(stock.Quantity) FROM dbo.ProductVariants stock
            WHERE stock.Product_Id = p.Product_Id AND stock.IsActive = 1
        ), 0) ELSE p.Quantity END AS Quantity,
        p.HasVariants,
        Servings,
        GPerServing,
        GNutrition,
        Price,
        DDV_Percentage,
        DDV_Amount,
        Price_Without_DDV,
        Price_With_DDV,
        Brand_Id,
        Flavor_Id,
        MainDescriptions,
        OtherDescriptionTitle,
        OtherDescriptionText,
        NutritionValuesIngredients,
        NutritionValuesIngredientsDescription,
        NutritionInformation,
        InstructionsForUse,
        InstructionsForUseDescription,
        InstructionsOnHowToUseIt,
        CreatedAt,
        UpdatedAt,
        NewInTheShop,
        ProductsOnSale,
        SalePrice,
        SaleEndDate,
        CASE
            WHEN ProductsOnSale = 1
             AND (SaleEndDate IS NULL OR SaleEndDate >= CAST(GETDATE() AS date))
             AND SalePrice > 0
             AND SalePrice < Price
                THEN SalePrice
            ELSE NULL
        END AS Compare_Price,
        UpcomingPromotion,
        ShortExpiry,
        ExpiryDate,
        IsGiftVoucher,
        VoucherMinAmount,
        VoucherMaxAmount,
        NameAl,
        RecommendedForYou,
        ProductsInTheOutlet,
        JustForMe
    FROM dbo.Products p;
END
GO
