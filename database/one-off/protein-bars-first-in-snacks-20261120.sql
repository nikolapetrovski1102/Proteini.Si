-- 2026-11-20: Protein Bars (protein-bars-snacks) becomes the first subcategory of Snacks (Ужина).
-- Shifts the other Snacks subcategories down by one; their relative order stays the same.
-- @DryRun = 1 (default) only prints the new order and rolls back.
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @DryRun BIT = 1;

DECLARE @Snacks INT, @Bars INT;
SELECT @Bars = Category_Id, @Snacks = Parent_Category_Id
FROM dbo.ProductCategories WHERE Category_Slug = N'protein-bars-snacks';

IF @Bars IS NULL OR @Snacks IS NULL
BEGIN
    RAISERROR('protein-bars-snacks not found; nothing changed.', 16, 1);
    RETURN;
END

BEGIN TRANSACTION;

WITH Ordered AS (
    SELECT Category_Id, Display_Order,
           ROW_NUMBER() OVER (ORDER BY CASE WHEN Category_Id = @Bars THEN 0 ELSE 1 END, Display_Order, Category_Id) AS NewOrder
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
