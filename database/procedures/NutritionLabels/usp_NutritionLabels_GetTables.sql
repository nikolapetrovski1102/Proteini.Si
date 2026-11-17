SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Nutrition tables of active variants, used to list the labels that are in use.
CREATE OR ALTER PROCEDURE dbo.usp_NutritionLabels_GetTables
AS
BEGIN
    SET NOCOUNT ON;

    SELECT v.Nutrition_Table_Json
    FROM dbo.ProductVariants v
    WHERE v.IsActive = 1
      AND v.Nutrition_Table_Json IS NOT NULL
      AND v.Nutrition_Table_Json <> N'';
END
GO
