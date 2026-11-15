SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Every (discount, product) pair a discount covers, whatever its dates or on/off switch:
-- products with chosen items (DiscountItems), all products of chosen brands, or all products in chosen categories and their
-- subcategories. Gift vouchers are never discounted.
CREATE OR ALTER FUNCTION dbo.fn_Discount_Products()
RETURNS TABLE
AS
RETURN
    WITH CategoryTree AS (
        SELECT d.Discount_Id, c.Category_Id, 0 AS Depth
        FROM dbo.Discounts d
        INNER JOIN dbo.DiscountTargets t ON t.Discount_Id = d.Discount_Id
        INNER JOIN dbo.ProductCategories c ON c.Category_Id = t.Target_Id
        WHERE d.Applies_To = N'categories'
        UNION ALL
        SELECT tree.Discount_Id, child.Category_Id, tree.Depth + 1
        FROM dbo.ProductCategories child
        INNER JOIN CategoryTree tree ON child.Parent_Category_Id = tree.Category_Id
        WHERE tree.Depth < 10
    ),
    Matches AS (
        SELECT d.Discount_Id, i.Product_Id
        FROM dbo.Discounts d
        INNER JOIN dbo.DiscountItems i ON i.Discount_Id = d.Discount_Id
        WHERE d.Applies_To = N'products'
        UNION
        SELECT d.Discount_Id, p.Product_Id
        FROM dbo.Discounts d
        INNER JOIN dbo.DiscountTargets t ON t.Discount_Id = d.Discount_Id
        INNER JOIN dbo.Products p ON p.Brand_Id = t.Target_Id
        WHERE d.Applies_To = N'brands'
        UNION
        SELECT tree.Discount_Id, m.Product_Id
        FROM CategoryTree tree
        INNER JOIN dbo.ProductCategoryMapping m ON m.Category_Id = tree.Category_Id
    )
    SELECT m.Discount_Id, m.Product_Id
    FROM Matches m
    INNER JOIN dbo.Products p ON p.Product_Id = m.Product_Id
    WHERE ISNULL(p.IsGiftVoucher, 0) = 0;
GO
