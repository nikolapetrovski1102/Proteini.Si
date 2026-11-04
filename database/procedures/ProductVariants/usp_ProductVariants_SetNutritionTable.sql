SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_SetNutritionTable
    @VariantId INT,
    @TableJson NVARCHAR(MAX),
    @ColumnsJson NVARCHAR(MAX),
    @RowsJson NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.ProductVariants
    SET Nutrition_Table_Json = @TableJson,
        Nutrition_Table_Columns = @ColumnsJson,
        Nutrition_Table_Rows = @RowsJson,
        Updated_At = GETDATE()
    WHERE Variant_Id = @VariantId;

    SELECT @@ROWCOUNT;
END
GO
