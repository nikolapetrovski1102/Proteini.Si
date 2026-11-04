SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantNutrition_Get
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(CASE WHEN EXISTS (
        SELECT 1 FROM dbo.ProductVariants WHERE Variant_Id = @VariantId AND IsActive = 1
    ) THEN 1 ELSE 0 END AS bit);

    SELECT Column_Id, Variant_Id, Column_Name, Display_Order, Is_First_Column, Created_At, Updated_At
    FROM dbo.VariantNutritionColumns
    WHERE Variant_Id = @VariantId
    ORDER BY Display_Order;

    SELECT Row_Id, Variant_Id, Row_Name, Display_Order, Created_At, Updated_At
    FROM dbo.VariantNutritionRows
    WHERE Variant_Id = @VariantId
    ORDER BY Display_Order;

    SELECT vnv.Value_Id, vnv.Row_Id, vnv.Column_Id, vnv.Cell_Value, vnv.Created_At, vnv.Updated_At
    FROM dbo.VariantNutritionValues vnv
    WHERE EXISTS (SELECT 1 FROM dbo.VariantNutritionRows vnr WHERE vnr.Row_Id = vnv.Row_Id AND vnr.Variant_Id = @VariantId)
      AND EXISTS (SELECT 1 FROM dbo.VariantNutritionColumns vnc WHERE vnc.Column_Id = vnv.Column_Id AND vnc.Variant_Id = @VariantId);
END
GO
