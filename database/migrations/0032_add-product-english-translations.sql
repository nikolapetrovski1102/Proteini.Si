SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('dbo.Products', 'NameEn') IS NULL
    ALTER TABLE dbo.Products ADD NameEn nvarchar(500) NULL;

IF COL_LENGTH('dbo.Products', 'DescriptionEn') IS NULL
    ALTER TABLE dbo.Products ADD DescriptionEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionValuesIngredientsEn') IS NULL
    ALTER TABLE dbo.Products ADD NutritionValuesIngredientsEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionValuesIngredientsDescriptionEn') IS NULL
    ALTER TABLE dbo.Products ADD NutritionValuesIngredientsDescriptionEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'NutritionInformationEn') IS NULL
    ALTER TABLE dbo.Products ADD NutritionInformationEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsForUseEn') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsForUseEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsForUseDescriptionEn') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsForUseDescriptionEn nvarchar(max) NULL;

IF COL_LENGTH('dbo.Products', 'InstructionsOnHowToUseItEn') IS NULL
    ALTER TABLE dbo.Products ADD InstructionsOnHowToUseItEn nvarchar(max) NULL;
GO
