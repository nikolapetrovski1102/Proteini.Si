SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Pieces per pack for capsule/tablet products (vitamins, minerals, ...): "90 capsules".
-- Unit_Form is a fixed key (capsules, softgels, tablets, chewables, effervescent, gummies); the shop translates it.
-- Kept on the variant, not on Packaging, because a packaging row (and its delivery weight) is shared by name.
IF COL_LENGTH('dbo.ProductVariants', 'Unit_Count') IS NULL
    ALTER TABLE dbo.ProductVariants ADD Unit_Count int NULL;

IF COL_LENGTH('dbo.ProductVariants', 'Unit_Form') IS NULL
    ALTER TABLE dbo.ProductVariants ADD Unit_Form nvarchar(20) NULL;
GO
