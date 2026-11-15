-- 2026-11-11: protein bars and protein snacks belong under Snacks (Ужина) only.
--   * Proteins › Protein Bars (protein-bars) and Weight Loss › Protein Bars (protein-bars-weight)
--       → Snacks › Protein Bars (protein-bars-snacks)
--   * Proteins › Protein Snacks (protein-snacks: cookies, donuts, wafers, pudding)
--       → Snacks › Snacks, unless the product already sits in another Snacks subcategory
--   * Each moved product keeps the Snacks main category, and loses the Proteins / Weight Loss main
--     category when it has no other subcategory left there.
-- The three emptied subcategories are NOT deleted (old links keep resolving); hide or delete them in admin.
--
-- @DryRun = 1 (default) only prints what would change and rolls back.
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @DryRun BIT = 1;

DECLARE @Snacks INT, @SnackBars INT, @SnackSnacks INT, @Proteins INT, @WeightLoss INT;
DECLARE @Old TABLE (Category_Id INT PRIMARY KEY, Kind NVARCHAR(10));

SELECT @SnackBars = Category_Id, @Snacks = Parent_Category_Id
FROM dbo.ProductCategories WHERE Category_Slug = N'protein-bars-snacks';
SELECT @SnackSnacks = Category_Id
FROM dbo.ProductCategories WHERE Parent_Category_Id = @Snacks AND Category_Slug = N'snacks';
SELECT @Proteins = Category_Id FROM dbo.ProductCategories WHERE Category_Slug = N'proteins' AND Parent_Category_Id IS NULL;
SELECT @WeightLoss = Category_Id FROM dbo.ProductCategories WHERE Category_Slug = N'weight-loss' AND Parent_Category_Id IS NULL;

INSERT INTO @Old (Category_Id, Kind)
SELECT Category_Id, CASE WHEN Category_Slug = N'protein-snacks' THEN N'snack' ELSE N'bar' END
FROM dbo.ProductCategories
WHERE Category_Slug IN (N'protein-bars', N'protein-bars-weight', N'protein-snacks');

IF @Snacks IS NULL OR @SnackBars IS NULL OR @SnackSnacks IS NULL OR (SELECT COUNT(*) FROM @Old) = 0
BEGIN
    RAISERROR('Expected categories not found; nothing changed.', 16, 1);
    RETURN;
END

BEGIN TRANSACTION;

DECLARE @Moved TABLE (Product_Id INT PRIMARY KEY, IsBar BIT);
INSERT INTO @Moved (Product_Id, IsBar)
SELECT pcm.Product_Id, MAX(CASE WHEN o.Kind = N'bar' THEN 1 ELSE 0 END)
FROM dbo.ProductCategoryMapping pcm
INNER JOIN @Old o ON o.Category_Id = pcm.Category_Id
GROUP BY pcm.Product_Id;

SELECT m.Product_Id, p.Name, m.IsBar,
       (SELECT STRING_AGG(c.Category_Name, N', ') FROM dbo.ProductCategoryMapping x
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = x.Category_Id WHERE x.Product_Id = m.Product_Id) AS CategoriesBefore
FROM @Moved m INNER JOIN dbo.Products p ON p.Product_Id = m.Product_Id
ORDER BY p.Name;

-- Snacks main category
INSERT INTO dbo.ProductCategoryMapping (Product_Id, Category_Id)
SELECT m.Product_Id, @Snacks FROM @Moved m
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductCategoryMapping x WHERE x.Product_Id = m.Product_Id AND x.Category_Id = @Snacks);

-- Bars → Snacks › Protein Bars
INSERT INTO dbo.ProductCategoryMapping (Product_Id, Category_Id)
SELECT m.Product_Id, @SnackBars FROM @Moved m
WHERE m.IsBar = 1
  AND NOT EXISTS (SELECT 1 FROM dbo.ProductCategoryMapping x WHERE x.Product_Id = m.Product_Id AND x.Category_Id = @SnackBars);

-- Other protein snacks → Snacks › Snacks when they are in no Snacks subcategory yet
INSERT INTO dbo.ProductCategoryMapping (Product_Id, Category_Id)
SELECT m.Product_Id, @SnackSnacks FROM @Moved m
WHERE m.IsBar = 0
  AND NOT EXISTS (
        SELECT 1 FROM dbo.ProductCategoryMapping x
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = x.Category_Id
        WHERE x.Product_Id = m.Product_Id AND c.Parent_Category_Id = @Snacks);

DELETE pcm
FROM dbo.ProductCategoryMapping pcm
INNER JOIN @Old o ON o.Category_Id = pcm.Category_Id;

-- Drop the Proteins / Weight Loss main category where no subcategory of it is left
DELETE pcm
FROM dbo.ProductCategoryMapping pcm
INNER JOIN @Moved m ON m.Product_Id = pcm.Product_Id
WHERE pcm.Category_Id IN (@Proteins, @WeightLoss)
  AND NOT EXISTS (
        SELECT 1 FROM dbo.ProductCategoryMapping x
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = x.Category_Id
        WHERE x.Product_Id = pcm.Product_Id AND c.Parent_Category_Id = pcm.Category_Id);

SELECT m.Product_Id, p.Name,
       (SELECT STRING_AGG(c.Category_Name, N', ') FROM dbo.ProductCategoryMapping x
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = x.Category_Id WHERE x.Product_Id = m.Product_Id) AS CategoriesAfter
FROM @Moved m INNER JOIN dbo.Products p ON p.Product_Id = m.Product_Id
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
