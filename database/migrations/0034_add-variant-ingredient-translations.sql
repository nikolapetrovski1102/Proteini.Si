SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Albanian / English copies of the per-variant ingredients text (PDP falls back to Macedonian).
IF COL_LENGTH('dbo.ProductVariants', 'IngredientsAl') IS NULL
    ALTER TABLE dbo.ProductVariants ADD IngredientsAl nvarchar(max) NULL;

IF COL_LENGTH('dbo.ProductVariants', 'IngredientsEn') IS NULL
    ALTER TABLE dbo.ProductVariants ADD IngredientsEn nvarchar(max) NULL;
GO
