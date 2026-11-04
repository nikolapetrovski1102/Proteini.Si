SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetById
    @ProductId INT
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
        p.Servings,
        p.GPerServing,
        p.GNutrition,
        p.Price,
        p.DDV_Percentage,
        p.LoyaltyPercentage,
        p.Flavor_Id,
        p.Brand_Id,
        p.MainDescriptions,
        p.OtherDescriptionTitle,
        p.OtherDescriptionText,
        p.NutritionValuesIngredients,
        p.NutritionValuesIngredientsDescription,
        p.NutritionInformation,
        p.InstructionsForUse,
        p.InstructionsForUseDescription,
        p.InstructionsOnHowToUseIt,
        p.CreatedAt,
        p.UpdatedAt,
        p.NewInTheShop,
        p.ProductsOnSale,
        p.SalePrice,
        p.SaleEndDate,
        CASE
            WHEN p.ProductsOnSale = 1
             AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
             AND p.SalePrice > 0
             AND p.SalePrice < p.Price
                THEN p.SalePrice
            ELSE NULL
        END AS Compare_Price,
        p.UpcomingPromotion,
        p.ShortExpiry,
        p.ExpiryDate,
        p.IsGiftVoucher,
        p.VoucherMinAmount,
        p.VoucherMaxAmount,
        p.NameAl,
        p.DescriptionAl,
        p.NutritionValuesIngredientsAl,
        p.NutritionValuesIngredientsDescriptionAl,
        p.NutritionInformationAl,
        p.InstructionsForUseAl,
        p.InstructionsForUseDescriptionAl,
        p.InstructionsOnHowToUseItAl,
        p.RecommendedForYou,
        p.ProductsInTheOutlet,
        p.JustForMe,
        b.Brand_Name AS BrandName,
        f.Flavor_Name AS FlavorName
    FROM dbo.Products p
    LEFT JOIN dbo.Brands b ON p.Brand_Id = b.Brand_Id
    LEFT JOIN dbo.Flavors f ON p.Flavor_Id = f.Flavor_Id
    WHERE p.Product_Id = @ProductId;

    SELECT c.*
    FROM dbo.ProductCategoryMapping pcm
    INNER JOIN dbo.ProductCategories c ON pcm.Category_Id = c.Category_Id
    WHERE pcm.Product_Id = @ProductId
    ORDER BY c.Display_Order;

    SELECT s.*
    FROM dbo.ProductSportMapping psm
    INNER JOIN dbo.Sports s ON psm.Sport_Id = s.Sport_Id
    WHERE psm.Product_Id = @ProductId
    ORDER BY s.Display_Order;

    SELECT g.*
    FROM dbo.ProductGoalMapping pgm
    INNER JOIN dbo.Goals g ON pgm.Goal_Id = g.Goal_Id
    WHERE pgm.Product_Id = @ProductId
    ORDER BY g.Display_Order;

    SELECT u.*
    FROM dbo.ProductUseTimingMapping putm
    INNER JOIN dbo.UseTimings u ON putm.UseTiming_Id = u.UseTiming_Id
    WHERE putm.Product_Id = @ProductId
    ORDER BY u.Display_Order;

    SELECT t.*
    FROM dbo.ProductTagMapping ptm
    INNER JOIN dbo.ProductTags t ON ptm.Tag_Id = t.Tag_Id
    WHERE ptm.Product_Id = @ProductId
    ORDER BY t.Display_Order;

    SELECT
        pv.*,
        f.Flavor_Name AS Flavor_Name,
        pkg.Packaging_Name AS Packaging_Name,
        pkg.Packaging_Type AS Packaging_Type,
        pkg.Weight_Grams AS Weight_Grams
    FROM dbo.ProductVariants pv
    LEFT JOIN dbo.Flavors f ON pv.Flavor_Id = f.Flavor_Id
    LEFT JOIN dbo.Packaging pkg ON pv.Packaging_Id = pkg.Packaging_Id
    WHERE pv.Product_Id = @ProductId AND pv.IsActive = 1
    ORDER BY
        CASE WHEN pkg.Weight_Grams IS NULL THEN 1 ELSE 0 END,
        pkg.Weight_Grams ASC,
        pv.Display_Order ASC,
        pv.Variant_Id ASC;
END
GO
