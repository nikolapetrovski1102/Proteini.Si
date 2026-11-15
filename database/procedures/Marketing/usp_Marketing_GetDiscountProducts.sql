SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- The discount itself (first result) and the products it currently discounts (second result), biggest saving
-- first, for the "new discount" email. A product with variants shows its cheapest discounted variant.
-- Out-of-stock products and products without an image are left out.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetDiscountProducts
    @DiscountId INT,
    @Top INT = 6
AS
BEGIN
    SET NOCOUNT ON;

    SELECT d.Discount_Id AS DiscountId, d.Name, d.Discount_Type AS DiscountType, d.Percentage,
           d.Applies_To AS AppliesTo, d.Ends_On AS EndsOn
    FROM dbo.Discounts d
    WHERE d.Discount_Id = @DiscountId;

    WITH Items AS (
        -- Products without variants: the sale price usp_Discount_Sync wrote.
        SELECT p.Product_Id, CAST(p.Price AS DECIMAL(18, 2)) AS Price, a.Applied_SalePrice AS SalePrice
        FROM dbo.DiscountAppliedProducts a
        INNER JOIN dbo.Products p ON p.Product_Id = a.Product_Id
        WHERE a.Discount_Id = @DiscountId AND ISNULL(p.HasVariants, 0) = 0
          AND a.Applied_SalePrice > 0 AND a.Applied_SalePrice < p.Price
        UNION ALL
        -- Variants: the discounted variant price (Compare_Price) next to the variant's normal price.
        SELECT v.Product_Id, CAST(pv.Price AS DECIMAL(18, 2)), v.Applied_Compare_Price
        FROM dbo.DiscountAppliedVariants v
        INNER JOIN dbo.ProductVariants pv ON pv.Variant_Id = v.Variant_Id
        WHERE v.Discount_Id = @DiscountId AND pv.IsActive = 1 AND pv.Quantity > 0
          AND v.Applied_Compare_Price > 0 AND v.Applied_Compare_Price < pv.Price
    ),
    Ranked AS (
        SELECT i.*, ROW_NUMBER() OVER (PARTITION BY i.Product_Id ORDER BY i.SalePrice, i.Price) AS Rn
        FROM Items i
    )
    SELECT TOP (@Top) p.Product_Id AS ProductId, p.Name AS ProductName, p.Img AS ProductImg,
           r.Price, r.SalePrice
    FROM Ranked r
    INNER JOIN dbo.Products p ON p.Product_Id = r.Product_Id
    WHERE r.Rn = 1 AND p.Img IS NOT NULL
    ORDER BY (r.Price - r.SalePrice) / r.Price DESC, p.UpdatedAt DESC;
END
GO
