SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_ExistsActive
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(CASE WHEN EXISTS (
        SELECT 1 FROM dbo.ProductVariants WHERE Variant_Id = @VariantId AND IsActive = 1
    ) THEN 1 ELSE 0 END AS bit);
END
GO
