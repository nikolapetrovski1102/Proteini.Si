SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantNutrition_Delete
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        DELETE FROM dbo.VariantNutritionValues
        WHERE Row_Id IN (SELECT Row_Id FROM dbo.VariantNutritionRows WHERE Variant_Id = @VariantId);
        DELETE FROM dbo.VariantNutritionRows WHERE Variant_Id = @VariantId;
        DELETE FROM dbo.VariantNutritionColumns WHERE Variant_Id = @VariantId;

    COMMIT TRANSACTION;
END
GO
