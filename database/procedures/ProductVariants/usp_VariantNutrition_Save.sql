SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantNutrition_Save
    @VariantId INT,
    @ColumnsJson NVARCHAR(MAX),
    @RowsJson NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.ProductVariants WITH (UPDLOCK, HOLDLOCK) WHERE Variant_Id = @VariantId)
        BEGIN
            COMMIT TRANSACTION;
            SELECT CAST(0 AS bit);
            RETURN;
        END

        DELETE FROM dbo.VariantNutritionValues
        WHERE Row_Id IN (SELECT Row_Id FROM dbo.VariantNutritionRows WHERE Variant_Id = @VariantId);
        DELETE FROM dbo.VariantNutritionRows WHERE Variant_Id = @VariantId;
        DELETE FROM dbo.VariantNutritionColumns WHERE Variant_Id = @VariantId;

        DECLARE @ColumnIds TABLE (Position INT PRIMARY KEY, Column_Id INT);
        DECLARE @Position INT = 0, @ColumnCount INT, @RowCount INT, @Id INT;

        SELECT @ColumnCount = COUNT(*) FROM OPENJSON(@ColumnsJson);
        SELECT @RowCount = COUNT(*) FROM OPENJSON(@RowsJson);

        WHILE @Position < @ColumnCount
        BEGIN
            INSERT INTO dbo.VariantNutritionColumns (Variant_Id, Column_Name, Column_Key, Display_Order, Is_First_Column, Created_At, Updated_At)
            SELECT @VariantId, c.Name, c.ColumnKey, c.DisplayOrder, c.IsFirstColumn, GETDATE(), GETDATE()
            FROM OPENJSON(@ColumnsJson, CONCAT('$[', @Position, ']'))
                WITH (Name NVARCHAR(MAX) '$.Name', ColumnKey NVARCHAR(MAX) '$.ColumnKey',
                      DisplayOrder INT '$.DisplayOrder', IsFirstColumn BIT '$.IsFirstColumn') c;

            INSERT INTO @ColumnIds VALUES (@Position, CAST(SCOPE_IDENTITY() AS int));
            SET @Position += 1;
        END

        SET @Position = 0;
        WHILE @Position < @RowCount
        BEGIN
            INSERT INTO dbo.VariantNutritionRows (Variant_Id, Row_Name, Display_Order, Created_At, Updated_At)
            SELECT @VariantId, r.Name, r.DisplayOrder, GETDATE(), GETDATE()
            FROM OPENJSON(@RowsJson, CONCAT('$[', @Position, ']'))
                WITH (Name NVARCHAR(MAX) '$.Name', DisplayOrder INT '$.DisplayOrder') r;

            SET @Id = CAST(SCOPE_IDENTITY() AS int);

            INSERT INTO dbo.VariantNutritionValues (Row_Id, Column_Id, Cell_Value, Created_At, Updated_At)
            SELECT @Id, ci.Column_Id, v.[value], GETDATE(), GETDATE()
            FROM OPENJSON(@RowsJson, CONCAT('$[', @Position, '].Cells')) v
            INNER JOIN @ColumnIds ci ON ci.Position = CAST(v.[key] AS int)
            ORDER BY ci.Position;

            SET @Position += 1;
        END

    COMMIT TRANSACTION;

    SELECT CAST(1 AS bit);
END
GO
