SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Create
    @Name NVARCHAR(MAX),
    @Category NVARCHAR(MAX) = NULL,
    @Quantity INT = NULL,
    @Servings INT = NULL,
    @GPerServing FLOAT = NULL,
    @GNutrition FLOAT = NULL,
    @Price DECIMAL(38, 28),
    @DDV_Percentage DECIMAL(38, 18),
    @DDV_Amount DECIMAL(38, 28),
    @Price_Without_DDV DECIMAL(38, 28),
    @Price_With_DDV DECIMAL(38, 28),
    @Brand_Id INT = NULL,
    @Flavor_Id INT = NULL,
    @MainDescriptions NVARCHAR(MAX) = NULL,
    @OtherDescriptionTitle NVARCHAR(MAX) = NULL,
    @OtherDescriptionText NVARCHAR(MAX) = NULL,
    @NutritionValuesIngredients NVARCHAR(MAX) = NULL,
    @NutritionValuesIngredientsDescription NVARCHAR(MAX) = NULL,
    @NutritionInformation NVARCHAR(MAX) = NULL,
    @InstructionsForUse NVARCHAR(MAX) = NULL,
    @InstructionsForUseDescription NVARCHAR(MAX) = NULL,
    @InstructionsOnHowToUseIt NVARCHAR(MAX) = NULL,
    @NewInTheShop BIT,
    @ProductsOnSale BIT,
    @SalePrice DECIMAL(38, 18) = NULL,
    @SaleEndDate DATETIME2 = NULL,
    @UpcomingPromotion BIT,
    @ShortExpiry BIT,
    @ExpiryDate DATETIME2 = NULL,
    @IsGiftVoucher BIT,
    @VoucherMinAmount DECIMAL(38, 18) = NULL,
    @VoucherMaxAmount DECIMAL(38, 18) = NULL,
    @NameAl NVARCHAR(MAX) = NULL,
    @DescriptionAl NVARCHAR(MAX) = NULL,
    @NutritionValuesIngredientsAl NVARCHAR(MAX) = NULL,
    @NutritionValuesIngredientsDescriptionAl NVARCHAR(MAX) = NULL,
    @NutritionInformationAl NVARCHAR(MAX) = NULL,
    @InstructionsForUseAl NVARCHAR(MAX) = NULL,
    @InstructionsForUseDescriptionAl NVARCHAR(MAX) = NULL,
    @InstructionsOnHowToUseItAl NVARCHAR(MAX) = NULL,
    @RecommendedForYou BIT,
    @ProductsInTheOutlet BIT,
    @JustForMe BIT,
    @LoyaltyPercentage DECIMAL(38, 18),
    @CategoryIds dbo.IntList READONLY,
    @SportIds dbo.IntList READONLY,
    @GoalIds dbo.IntList READONLY,
    @UseTimingIds dbo.IntList READONLY,
    @TagIds dbo.IntList READONLY,
    @HasVariants BIT,
    @Variant_Display_Type NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ProductId INT;

    BEGIN TRANSACTION;

        INSERT INTO dbo.Products
        (Name, Category, Quantity, Servings, GPerServing, GNutrition, Price, DDV_Percentage,
         DDV_Amount, Price_Without_DDV, Price_With_DDV, Brand_Id, Flavor_Id,
         MainDescriptions, OtherDescriptionTitle, OtherDescriptionText,
         NutritionValuesIngredients, NutritionValuesIngredientsDescription, NutritionInformation,
         InstructionsForUse, InstructionsForUseDescription, InstructionsOnHowToUseIt,
         NewInTheShop, ProductsOnSale, SalePrice, SaleEndDate, UpcomingPromotion, ShortExpiry, ExpiryDate,
         IsGiftVoucher, VoucherMinAmount, VoucherMaxAmount, NameAl, DescriptionAl,
         NutritionValuesIngredientsAl, NutritionValuesIngredientsDescriptionAl, NutritionInformationAl,
         InstructionsForUseAl, InstructionsForUseDescriptionAl, InstructionsOnHowToUseItAl,
         RecommendedForYou, ProductsInTheOutlet, JustForMe,
         HasVariants, Variant_Display_Type, LoyaltyPercentage)
        VALUES
        (@Name, @Category, @Quantity, @Servings, @GPerServing, @GNutrition, @Price, @DDV_Percentage,
         @DDV_Amount, @Price_Without_DDV, @Price_With_DDV, @Brand_Id, @Flavor_Id,
         @MainDescriptions, @OtherDescriptionTitle, @OtherDescriptionText,
         @NutritionValuesIngredients, @NutritionValuesIngredientsDescription, @NutritionInformation,
         @InstructionsForUse, @InstructionsForUseDescription, @InstructionsOnHowToUseIt,
         @NewInTheShop, @ProductsOnSale, @SalePrice, @SaleEndDate, @UpcomingPromotion, @ShortExpiry, @ExpiryDate,
         @IsGiftVoucher, @VoucherMinAmount, @VoucherMaxAmount, @NameAl, @DescriptionAl,
         @NutritionValuesIngredientsAl, @NutritionValuesIngredientsDescriptionAl, @NutritionInformationAl,
         @InstructionsForUseAl, @InstructionsForUseDescriptionAl, @InstructionsOnHowToUseItAl,
         @RecommendedForYou, @ProductsInTheOutlet, @JustForMe,
         @HasVariants, @Variant_Display_Type, @LoyaltyPercentage);

        SET @ProductId = CAST(SCOPE_IDENTITY() AS int);

        INSERT INTO dbo.ProductCategoryMapping (Product_Id, Category_Id) SELECT @ProductId, Id FROM @CategoryIds;
        INSERT INTO dbo.ProductSportMapping (Product_Id, Sport_Id) SELECT @ProductId, Id FROM @SportIds;
        INSERT INTO dbo.ProductGoalMapping (Product_Id, Goal_Id) SELECT @ProductId, Id FROM @GoalIds;
        INSERT INTO dbo.ProductUseTimingMapping (Product_Id, UseTiming_Id) SELECT @ProductId, Id FROM @UseTimingIds;
        INSERT INTO dbo.ProductTagMapping (Product_Id, Tag_Id) SELECT @ProductId, Id FROM @TagIds;

    COMMIT TRANSACTION;

    SELECT @ProductId;
END
GO
