SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_GetNutritionTable
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Nutrition_Table_Json
    FROM dbo.ProductVariants
    WHERE Variant_Id = @VariantId AND IsActive = 1;
END
GO
