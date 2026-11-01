SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COL_LENGTH('dbo.Products', 'SalePrice') IS NULL
BEGIN
    ALTER TABLE dbo.Products ADD SalePrice decimal(18,2) NULL;
END;

IF COL_LENGTH('dbo.Products', 'SaleEndDate') IS NULL
BEGIN
    ALTER TABLE dbo.Products ADD SaleEndDate date NULL;
END;

-- Existing variant discounts stay unchanged. This migration only adds an
-- explicit sale price for products without variants and a shared sale end date.
