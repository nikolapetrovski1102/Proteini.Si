SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FreeGift_Update
    @FreeGiftId INT,
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

    UPDATE dbo.FreeGifts
    SET ProductId = @ProductId,
        VariantId = @VariantId,
        DisplayName = @DisplayName,
        MinimumOrderAmount = @MinimumOrderAmount,
        ValidFrom = @ValidFrom,
        ValidUntil = @ValidUntil,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE FreeGiftId = @FreeGiftId;

    SELECT CASE WHEN @@ROWCOUNT = 0 THEN 4 ELSE 0 END AS Result, @FreeGiftId AS FreeGiftId;
END
GO
