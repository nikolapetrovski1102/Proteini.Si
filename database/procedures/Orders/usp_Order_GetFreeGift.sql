SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetFreeGift
    @FreeGiftId INT,
    @Subtotal DECIMAL(38, 10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        fg.FreeGiftId,
        fg.ProductId,
        fg.VariantId,
        COALESCE(NULLIF(fg.DisplayName, ''),
            CASE WHEN fg.VariantId IS NULL THEN p.Name
                 ELSE CONCAT(p.Name, ' - ', COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''), pv.Packaging_Name)) END
        ) AS DisplayName,
        p.HasVariants,
        CASE WHEN fg.VariantId IS NULL THEN p.Quantity ELSE pv.Quantity END AS AvailableQuantity
    FROM dbo.FreeGifts fg
    INNER JOIN dbo.Products p ON p.Product_Id = fg.ProductId
    LEFT JOIN dbo.ProductVariants pv ON pv.Variant_Id = fg.VariantId AND pv.Product_Id = fg.ProductId AND pv.IsActive = 1
    WHERE fg.FreeGiftId = @FreeGiftId
      AND fg.IsActive = 1
      AND fg.MinimumOrderAmount <= @Subtotal
      AND (fg.ValidFrom IS NULL OR fg.ValidFrom <= GETDATE())
      AND (fg.ValidUntil IS NULL OR fg.ValidUntil >= GETDATE());
END
GO
