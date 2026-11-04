SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_Create
    @ProductId INT,
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
    @NutritionInfo NVARCHAR(MAX),
    @Description NVARCHAR(MAX),
    @DisplayOrder INT,
    @IsDefault BIT,
    @LoyaltyPercentage DECIMAL(5, 2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.Products WITH (UPDLOCK, HOLDLOCK) WHERE Product_Id = @ProductId)
        BEGIN
            COMMIT TRANSACTION;
            SELECT CAST(NULL AS int) AS VariantId;
            RETURN;
        END

        DECLARE @ResolvedPackagingId INT;
        EXEC dbo.usp_ProductVariants_ResolvePackaging
            @PackagingId = @PackagingId,
            @PackagingName = @ResolvePackagingName,
            @WeightGrams = @WeightGrams,
            @HasWeight = @HasWeight,
            @ResolvedId = @ResolvedPackagingId OUTPUT;

        INSERT INTO dbo.ProductVariants (
            Product_Id, SKU, Flavor_Id, Flavor_Name, Packaging_Id, Packaging_Name,
            Price, DDV_Percentage, Compare_Price,
            Quantity, Low_Stock_Threshold, Variant_Name, Option_Type, Variant_Image_Path, Ingredients,
            Nutrition_Info, Description, Display_Order, IsActive, IsDefault,
            LoyaltyPercentage, Created_At, Updated_At
        ) VALUES (
            @ProductId, @SKU, @FlavorId, @FlavorName, @ResolvedPackagingId, @PackagingName,
            @Price, @DDVPercentage, @ComparePrice,
            @Quantity, @LowStockThreshold, @VariantName, @OptionType, @VariantImagePath, @Ingredients,
            @NutritionInfo, @Description, @DisplayOrder, 1, @IsDefault,
            @LoyaltyPercentage, GETDATE(), GETDATE()
        );

        DECLARE @VariantId INT = CAST(SCOPE_IDENTITY() AS int);

        IF @IsDefault = 1
            UPDATE dbo.Products SET Default_Variant_Id = @VariantId WHERE Product_Id = @ProductId;

        UPDATE dbo.Products SET HasVariants = 1 WHERE Product_Id = @ProductId;

    COMMIT TRANSACTION;

    SELECT @VariantId AS VariantId;
END
GO
