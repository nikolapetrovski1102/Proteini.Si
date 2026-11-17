SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Shared AL/EN translations for the words in the per-variant nutrition tables
-- (row names, column headers, text cells). Mk is the Macedonian text with
-- whitespace collapsed; the API falls back to Macedonian when a translation is missing.
IF OBJECT_ID('dbo.NutritionLabelTranslations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.NutritionLabelTranslations
    (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_NutritionLabelTranslations PRIMARY KEY,
        Mk nvarchar(400) COLLATE Latin1_General_100_BIN2 NOT NULL,
        Al nvarchar(400) NULL,
        En nvarchar(400) NULL,
        UpdatedAt datetime2 NOT NULL CONSTRAINT DF_NutritionLabelTranslations_UpdatedAt DEFAULT SYSUTCDATETIME()
    );

    CREATE UNIQUE INDEX UX_NutritionLabelTranslations_Mk ON dbo.NutritionLabelTranslations (Mk);
END
GO
