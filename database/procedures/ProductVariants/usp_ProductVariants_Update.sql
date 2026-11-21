SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_Update
    @VariantId INT,
    @SKU NVARCHAR(MAX),
    @FlavorId INT,
    @FlavorName NVARCHAR(MAX),
    @PackagingId INT,
    @PackagingName NVARCHAR(MAX),
    @ResolvePackagingName NVARCHAR(MAX),
    @WeightGrams DECIMAL(10, 2),
    @HasWeight BIT,
    @Price DECIMAL(18, 2),
    @DDVPercentage DECIMAL(5, 2),
    @ComparePrice DECIMAL(18, 2),
    @Quantity INT,
    @LowStockThreshold INT,
    @VariantName NVARCHAR(MAX),
    @OptionType NVARCHAR(MAX),
    @VariantImagePath NVARCHAR(MAX),
    @Ingredients NVARCHAR(MAX),
    @IngredientsAl NVARCHAR(MAX) = NULL,
    @IngredientsEn NVARCHAR(MAX) = NULL,
    @NutritionInfo NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @DisplayOrder INT,
    @IsActive BIT,
    @IsDefault BIT,
    @LoyaltyPercentage DECIMAL(5, 2),
    @UnitCount INT = NULL,
    @UnitForm NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        DECLARE @ResolvedPackagingId INT;
        EXEC dbo.usp_ProductVariants_ResolvePackaging
            @PackagingId = @PackagingId,
            @PackagingName = @ResolvePackagingName,
            @WeightGrams = @WeightGrams,
            @HasWeight = @HasWeight,
            @ResolvedId = @ResolvedPackagingId OUTPUT;

        UPDATE dbo.ProductVariants
        SET SKU = @SKU,
            Flavor_Id = @FlavorId,
            Flavor_Name = @FlavorName,
            Packaging_Id = @ResolvedPackagingId,
            Packaging_Name = @PackagingName,
            Price = @Price,
            DDV_Percentage = @DDVPercentage,
            Compare_Price = @ComparePrice,
            Quantity = @Quantity,
            Low_Stock_Threshold = @LowStockThreshold,
            Variant_Name = @VariantName,
            Option_Type = @OptionType,
            Variant_Image_Path = @VariantImagePath,
            Ingredients = @Ingredients,
            IngredientsAl = @IngredientsAl,
            IngredientsEn = @IngredientsEn,
            Nutrition_Info = @NutritionInfo,
            Description = @Description,
            Display_Order = @DisplayOrder,
            IsActive = @IsActive,
            IsDefault = @IsDefault,
            LoyaltyPercentage = @LoyaltyPercentage,
            Unit_Count = @UnitCount,
            Unit_Form = @UnitForm,
            Updated_At = GETDATE()
        WHERE Variant_Id = @VariantId;

        DECLARE @Affected INT = @@ROWCOUNT;
        DECLARE @ProductId INT = (SELECT Product_Id FROM dbo.ProductVariants WHERE Variant_Id = @VariantId);

        IF @Affected > 0 AND @IsDefault = 1
        BEGIN
            UPDATE dbo.ProductVariants SET IsDefault = 0 WHERE Product_Id = @ProductId AND Variant_Id != @VariantId;
            UPDATE dbo.Products SET Default_Variant_Id = @VariantId WHERE Product_Id = @ProductId;
        END

        IF @Affected > 0
            EXEC dbo.usp_Product_SyncPriceFromVariants @ProductId = @ProductId;

    COMMIT TRANSACTION;

    SELECT @Affected;
END
GO
