SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FreeGift_Create
    @ProductId INT,
    @VariantId INT,
    @DisplayName NVARCHAR(4000),
    @MinimumOrderAmount DECIMAL(38, 10),
    @ValidFrom DATETIME2,
    @ValidUntil DATETIME2,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.Products p
        LEFT JOIN dbo.ProductVariants pv
            ON pv.Variant_Id = @VariantId
           AND pv.Product_Id = p.Product_Id
           AND pv.IsActive = 1
        WHERE p.Product_Id = @ProductId
          AND ((@VariantId IS NULL AND p.HasVariants = 0)
               OR (@VariantId IS NOT NULL AND pv.Variant_Id IS NOT NULL)))
    BEGIN
        SELECT 2 AS Result, CAST(NULL AS INT) AS FreeGiftId;
        RETURN;
    END

    INSERT INTO dbo.FreeGifts
        (ProductId, VariantId, DisplayName, MinimumOrderAmount, ValidFrom, ValidUntil, IsActive, CreatedAt, UpdatedAt)
    VALUES
        (@ProductId, @VariantId, @DisplayName, @MinimumOrderAmount, @ValidFrom, @ValidUntil, @IsActive, GETDATE(), GETDATE());

    SELECT 0 AS Result, CAST(SCOPE_IDENTITY() AS INT) AS FreeGiftId;
END
GO
