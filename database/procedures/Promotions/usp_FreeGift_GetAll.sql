SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FreeGift_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT fg.FreeGiftId,
           fg.ProductId,
           fg.VariantId,
           fg.DisplayName,
           fg.MinimumOrderAmount,
           fg.ValidFrom,
           fg.ValidUntil,
           fg.IsActive,
           fg.CreatedAt,
           fg.UpdatedAt,
           p.Name AS ProductName,
           COALESCE(NULLIF(pv.Flavor_Name, ''), NULLIF(pv.Variant_Name, ''), pv.Packaging_Name) AS VariantName,
           COALESCE(pv.Variant_Image_Path, p.Img) AS Image
    FROM dbo.FreeGifts fg
    INNER JOIN dbo.Products p ON p.Product_Id = fg.ProductId
    LEFT JOIN dbo.ProductVariants pv ON pv.Variant_Id = fg.VariantId
    ORDER BY fg.CreatedAt DESC, fg.FreeGiftId DESC;
END
GO
