SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.ProductVariants', 'Option_Type') IS NULL
BEGIN
    ALTER TABLE dbo.ProductVariants
        ADD Option_Type nvarchar(20) NOT NULL
            CONSTRAINT DF_ProductVariants_OptionType DEFAULT ('flavor') WITH VALUES;
END;

/* Existing shaker variants are colours, not flavours. */
EXEC sys.sp_executesql N'
UPDATE pv
SET Option_Type = ''color''
FROM dbo.ProductVariants pv
INNER JOIN dbo.Products p ON p.Product_Id = pv.Product_Id
WHERE LOWER(COALESCE(p.Name, '''')) LIKE ''%shaker%''
   OR LOWER(COALESCE(p.Name, '''')) LIKE N''%шејкер%'';';

IF NOT EXISTS
(
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.ProductVariants')
      AND name = 'CK_ProductVariants_OptionType'
)
BEGIN
    EXEC sys.sp_executesql N'
        ALTER TABLE dbo.ProductVariants WITH CHECK
            ADD CONSTRAINT CK_ProductVariants_OptionType
                CHECK (Option_Type IN (''flavor'', ''color''));';
END;

COMMIT TRANSACTION;
