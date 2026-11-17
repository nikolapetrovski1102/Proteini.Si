SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NutritionLabels_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Mk, Al, En
    FROM dbo.NutritionLabelTranslations;
END
GO
