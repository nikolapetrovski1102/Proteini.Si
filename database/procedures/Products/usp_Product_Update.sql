SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_Update
    @ProductId INT,
    @ReplaceImage BIT,
    @Img NVARCHAR(MAX) = NULL,
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
    @TagIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Changed TABLE (OldImg NVARCHAR(MAX) NULL, NewImg NVARCHAR(MAX) NULL);

    BEGIN TRANSACTION;

        UPDATE dbo.Products
        SET Name = @Name,
            Img = CASE WHEN @ReplaceImage = 1 THEN @Img ELSE Img END,
            Category = @Category,
            Quantity = @Quantity,
            Servings = @Servings,
            GPerServing = @GPerServing,
            GNutrition = @GNutrition,
            Price = @Price,
            DDV_Percentage = @DDV_Percentage,
            DDV_Amount = @DDV_Amount,
            Price_Without_DDV = @Price_Without_DDV,
            Price_With_DDV = @Price_With_DDV,
            Brand_Id = @Brand_Id,
            Flavor_Id = @Flavor_Id,
            MainDescriptions = @MainDescriptions,
            OtherDescriptionTitle = @OtherDescriptionTitle,
            OtherDescriptionText = @OtherDescriptionText,
            NutritionValuesIngredients = @NutritionValuesIngredients,
            NutritionValuesIngredientsDescription = @NutritionValuesIngredientsDescription,
            NutritionInformation = @NutritionInformation,
            InstructionsForUse = @InstructionsForUse,
            InstructionsForUseDescription = @InstructionsForUseDescription,
            InstructionsOnHowToUseIt = @InstructionsOnHowToUseIt,
            NewInTheShop = @NewInTheShop,
            ProductsOnSale = @ProductsOnSale,
            SalePrice = @SalePrice,
            SaleEndDate = @SaleEndDate,
            UpcomingPromotion = @UpcomingPromotion,
            ShortExpiry = @ShortExpiry,
            ExpiryDate = @ExpiryDate,
            IsGiftVoucher = @IsGiftVoucher,
            VoucherMinAmount = @VoucherMinAmount,
            VoucherMaxAmount = @VoucherMaxAmount,
            NameAl = @NameAl,
            DescriptionAl = @DescriptionAl,
            NutritionValuesIngredientsAl = @NutritionValuesIngredientsAl,
            NutritionValuesIngredientsDescriptionAl = @NutritionValuesIngredientsDescriptionAl,
            NutritionInformationAl = @NutritionInformationAl,
            InstructionsForUseAl = @InstructionsForUseAl,
            InstructionsForUseDescriptionAl = @InstructionsForUseDescriptionAl,
            InstructionsOnHowToUseItAl = @InstructionsOnHowToUseItAl,
            RecommendedForYou = @RecommendedForYou,
            ProductsInTheOutlet = @ProductsInTheOutlet,
            JustForMe = @JustForMe,
            LoyaltyPercentage = @LoyaltyPercentage,
            UpdatedAt = GETDATE()
        OUTPUT deleted.Img, inserted.Img INTO @Changed (OldImg, NewImg)
        WHERE Product_Id = @ProductId;

        IF EXISTS (SELECT 1 FROM @Changed)
        BEGIN
            DELETE FROM dbo.ProductCategoryMapping WHERE Product_Id = @ProductId;
            DELETE FROM dbo.ProductSportMapping WHERE Product_Id = @ProductId;
            DELETE FROM dbo.ProductGoalMapping WHERE Product_Id = @ProductId;
            DELETE FROM dbo.ProductUseTimingMapping WHERE Product_Id = @ProductId;
            DELETE FROM dbo.ProductTagMapping WHERE Product_Id = @ProductId;

        INSERT INTO dbo.ProductCategoryMapping (Product_Id, Category_Id) SELECT @ProductId, Id FROM @CategoryIds;
        INSERT INTO dbo.ProductSportMapping (Product_Id, Sport_Id) SELECT @ProductId, Id FROM @SportIds;
        INSERT INTO dbo.ProductGoalMapping (Product_Id, Goal_Id) SELECT @ProductId, Id FROM @GoalIds;
        INSERT INTO dbo.ProductUseTimingMapping (Product_Id, UseTiming_Id) SELECT @ProductId, Id FROM @UseTimingIds;
        INSERT INTO dbo.ProductTagMapping (Product_Id, Tag_Id) SELECT @ProductId, Id FROM @TagIds;
        END

    COMMIT TRANSACTION;

    SELECT OldImg, NewImg FROM @Changed;
END
GO
