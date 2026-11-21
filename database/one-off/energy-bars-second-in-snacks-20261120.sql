-- 2026-11-20 (CEO): Energy Bars (energy-bars-snacks) becomes the second subcategory of Snacks (Ужина), right after Protein Bars.
-- Protein Bars stays first; shifts the other Snacks subcategories down by one; their relative order stays the same.
-- @DryRun = 1 (default) only prints the new order and rolls back.
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @DryRun BIT = 1;

DECLARE @Snacks INT, @Energy INT;
SELECT @Energy = Category_Id, @Snacks = Parent_Category_Id
FROM dbo.ProductCategories WHERE Category_Slug = N'energy-bars-snacks';

IF @Energy IS NULL OR @Snacks IS NULL
BEGIN
    RAISERROR('energy-bars-snacks not found; nothing changed.', 16, 1);
    RETURN;
END

BEGIN TRANSACTION;

WITH Ordered AS (
    SELECT Category_Id, Display_Order,
           ROW_NUMBER() OVER (ORDER BY CASE WHEN Category_Slug = N'protein-bars-snacks' THEN 0 WHEN Category_Id = @Energy THEN 1 ELSE 2 END, Display_Order, Category_Id) AS NewOrder
    FROM dbo.ProductCategories
    WHERE Parent_Category_Id = @Snacks
)
UPDATE Ordered SET Display_Order = NewOrder;

SELECT Category_Id, Category_Name, Category_Slug, Display_Order
FROM dbo.ProductCategories WHERE Parent_Category_Id = @Snacks ORDER BY Display_Order;

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
