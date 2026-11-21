-- 2026-11-21: fill ProductVariants.Unit_Count / Unit_Form (migration 0035) for capsule/tablet products that already
-- say the count somewhere: in the flavour field ("90 капсули"), the size ("150 капсули") or the product name
-- ("OLIMP TRIBUSTERON 90, 120 caps, 51.4g"). The most specific "<number> <word>" wins;
-- on a tie, flavour > size > name.
-- When the flavour field only held the pill count, it is cleared (the count now shows with the size instead).
-- Skips variants that already have a count, and mixed packs like "30 tabs + 30 caps".
-- Capsule products with no count anywhere get the gram size rounded to the nearest 10 ("64.62g" -> 60 capsules).
-- Anything still missing is listed at the end: fill those in admin.
-- @DryRun = 1 (default) only prints what would change and rolls back.
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @DryRun BIT = 1;

IF COL_LENGTH('dbo.ProductVariants', 'Unit_Count') IS NULL
BEGIN
    RAISERROR('Run migration 0035_add-variant-unit-count.sql first; nothing changed.', 16, 1);
    RETURN;
END

-- Most specific words first so "меки капсули" wins over "капсули".
DECLARE @Words TABLE (Rank INT, Word NVARCHAR(40), Form NVARCHAR(20));
INSERT INTO @Words VALUES
    (1, N'меки капсули', N'softgels'),
    (2, N'таблети за џвакање', N'chewables'),
    (3, N'шумливи таблети', N'effervescent'),
    (4, N'гумени бонбони', N'gummies'),
    (5, N'капсули', N'capsules'),
    (6, N'капсула', N'capsules'),
    (7, N'таблети', N'tablets'),
    (8, N'таблета', N'tablets'),
    (9, N'softgels', N'softgels'),
    (10, N'capsules', N'capsules'),
    (11, N'caps', N'capsules'),
    (12, N'tablets', N'tablets'),
    (13, N'tabs', N'tablets'),
    (14, N'gummies', N'gummies'),
    (15, N'kapsula', N'capsules'),
    (16, N'tableta', N'tablets');

;WITH Sources AS (
    SELECT pv.Variant_Id, s.Ord, s.Source, s.Txt
    FROM dbo.ProductVariants pv
    JOIN dbo.Products p ON p.Product_Id = pv.Product_Id
    LEFT JOIN dbo.Flavors fl ON fl.Flavor_Id = pv.Flavor_Id
    CROSS APPLY (VALUES
        (1, N'flavour', COALESCE(fl.Flavor_Name, pv.Flavor_Name)),
        (2, N'size', pv.Packaging_Name),
        (3, N'name', p.Name)
    ) s(Ord, Source, Txt)
    WHERE pv.IsActive = 1
      AND pv.Unit_Count IS NULL
      AND s.Txt IS NOT NULL
      -- "30 tabs + 30 caps": two kinds in one pack, leave for a person.
      AND NOT (s.Txt LIKE N'%[0-9] tabs%+%[0-9] caps%' OR s.Txt LIKE N'%[0-9] caps%+%[0-9] tabs%')
),
Hits AS (
    SELECT src.Variant_Id, src.Ord, src.Source, src.Txt, w.Rank, w.Word, w.Form,
           -- Last digit of the number right before " <word>"
           PATINDEX(N'%[0-9] ' + w.Word + N'%', src.Txt COLLATE Cyrillic_General_CI_AI) AS DigitPos
    FROM Sources src
    CROSS JOIN @Words w
),
Parsed AS (
    SELECT h.Variant_Id, h.Ord, h.Source, h.Txt, h.Rank, h.Word, h.Form,
           REVERSE(LEFT(REVERSE(LEFT(h.Txt, h.DigitPos)),
                        PATINDEX(N'%[^0-9]%', REVERSE(LEFT(h.Txt, h.DigitPos)) + N'x') - 1)) AS CountText
    FROM Hits h
    WHERE h.DigitPos > 0
),
Best AS (
    SELECT Variant_Id, Source, Txt, Word, Form, TRY_CONVERT(INT, CountText) AS UnitCount,
           -- Most specific word wins ("таблети за џвакање" in the name beats "таблети" in the flavour), then flavour > size > name.
           ROW_NUMBER() OVER (PARTITION BY Variant_Id ORDER BY Rank, Ord) AS Pick
    FROM Parsed
)
SELECT Variant_Id, Source, Txt, Word, Form, UnitCount
INTO #Fill
FROM Best
WHERE Pick = 1 AND UnitCount BETWEEN 1 AND 10000;

BEGIN TRANSACTION;

UPDATE pv
SET Unit_Count = f.UnitCount,
    Unit_Form = f.Form,
    Updated_At = GETDATE()
FROM dbo.ProductVariants pv
JOIN #Fill f ON f.Variant_Id = pv.Variant_Id;

-- Flavour that was only the pill count ("90 капсули"): clear it, including the Flavors link the listings read.
UPDATE pv
SET Flavor_Name = NULL,
    Flavor_Id = NULL
FROM dbo.ProductVariants pv
JOIN #Fill f ON f.Variant_Id = pv.Variant_Id
LEFT JOIN dbo.Flavors fl ON fl.Flavor_Id = pv.Flavor_Id
WHERE EXISTS (SELECT 1 FROM @Words w
              WHERE LTRIM(RTRIM(COALESCE(fl.Flavor_Name, pv.Flavor_Name))) COLLATE Cyrillic_General_CI_AI
                    = CONCAT(f.UnitCount, N' ', w.Word));

SELECT f.Variant_Id, p.Name AS Product, f.Source AS FoundIn, f.Txt AS FoundText,
       pv.Unit_Count, pv.Unit_Form, pv.Packaging_Name, pv.Flavor_Name AS FlavourAfter
FROM #Fill f
JOIN dbo.ProductVariants pv ON pv.Variant_Id = f.Variant_Id
JOIN dbo.Products p ON p.Product_Id = pv.Product_Id
ORDER BY p.Name, f.Variant_Id;

-- Capsule-type products: vitamin/mineral categories (or their parent), omega-3, zinc, magnesium,
-- or a name that says caps/tabs/капсули/таблети.
SELECT p.Product_Id
INTO #Pill
FROM dbo.Products p
WHERE EXISTS (SELECT 1 FROM dbo.ProductCategoryMapping pcm
              JOIN dbo.ProductCategories c ON c.Category_Id = pcm.Category_Id
              LEFT JOIN dbo.ProductCategories parent ON parent.Category_Id = c.Parent_Category_Id
              WHERE pcm.Product_Id = p.Product_Id
                AND (c.Category_Slug LIKE N'%vitamin%' OR parent.Category_Slug LIKE N'%vitamin%'
                     OR c.Category_Slug LIKE N'%mineral%' OR parent.Category_Slug LIKE N'%mineral%'
                     OR c.Category_Slug IN (N'omega-3', N'zinc', N'magnesium', N'b-complex', N'vitamin-c', N'vitamin-d')))
   OR p.Name LIKE N'%caps%' OR p.Name LIKE N'%tabs%' OR p.Name LIKE N'%капсул%' OR p.Name LIKE N'%таблет%';

-- No count written anywhere (2026-11-21, user): the size is the pack weight in grams, and the pill count is
-- that number rounded to the nearest 10 ("58.4g" / "62.45g" -> 60, "115.29" -> 120). Only sizes that are just
-- a gram number (no ml, no "10x15g") and variants without a flavour (flavoured ones are powders/sachets).
SELECT pv.Variant_Id, pv.Packaging_Name,
       CAST(ROUND(TRY_CONVERT(decimal(10, 2),
            REPLACE(REPLACE(REPLACE(LOWER(LTRIM(RTRIM(pv.Packaging_Name))), N'g', N''), N' ', N''), N',', N'.')), -1) AS int) AS UnitCount
INTO #Rounded
FROM dbo.ProductVariants pv
JOIN #Pill pill ON pill.Product_Id = pv.Product_Id
LEFT JOIN dbo.Flavors fl ON fl.Flavor_Id = pv.Flavor_Id
WHERE pv.IsActive = 1
  AND pv.Unit_Count IS NULL
  AND LEN(LTRIM(RTRIM(COALESCE(fl.Flavor_Name, pv.Flavor_Name, N'')))) <= 1 -- empty, or a stray letter like "b"
  AND pv.Packaging_Name LIKE N'%[0-9]%'
  AND LOWER(pv.Packaging_Name) NOT LIKE N'%[^0-9., g]%'
  AND LEN(pv.Packaging_Name) - LEN(REPLACE(LOWER(pv.Packaging_Name), N'g', N'')) <= 1;

DELETE FROM #Rounded WHERE UnitCount IS NULL OR UnitCount < 10 OR UnitCount > 1000;

UPDATE pv
SET Unit_Count = r.UnitCount,
    Unit_Form = N'capsules',
    Updated_At = GETDATE()
FROM dbo.ProductVariants pv
JOIN #Rounded r ON r.Variant_Id = pv.Variant_Id;

SELECT r.Variant_Id, p.Name AS Product, r.Packaging_Name AS Size, r.UnitCount AS RoundedPills
FROM #Rounded r
JOIN dbo.ProductVariants pv ON pv.Variant_Id = r.Variant_Id
JOIN dbo.Products p ON p.Product_Id = pv.Product_Id
ORDER BY p.Name;

-- Still missing: capsule-type products with no count found. Fill these in admin.
SELECT pv.Variant_Id, p.Name AS Product, pv.Packaging_Name, pv.Flavor_Name
FROM dbo.ProductVariants pv
JOIN dbo.Products p ON p.Product_Id = pv.Product_Id
JOIN #Pill pill ON pill.Product_Id = p.Product_Id
WHERE pv.IsActive = 1 AND pv.Unit_Count IS NULL
ORDER BY p.Name;

IF @DryRun = 1
BEGIN
    ROLLBACK TRANSACTION;
    PRINT 'Dry run: rolled back. Set @DryRun = 0 to apply.';
END
ELSE
BEGIN
    COMMIT TRANSACTION;
    PRINT 'Applied.';
END

DROP TABLE IF EXISTS #Fill;
DROP TABLE IF EXISTS #Pill;
DROP TABLE IF EXISTS #Rounded;
