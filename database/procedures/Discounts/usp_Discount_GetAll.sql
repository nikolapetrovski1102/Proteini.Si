SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Admin list. Result 1: discounts with how many products they cover and how many currently show
-- this discount (an item covered by a bigger discount counts for that one). Result 2: brand/category
-- targets. Result 3: product items (Variant_Id 0 = product without variants) with their new price.
CREATE OR ALTER PROCEDURE dbo.usp_Discount_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT d.Discount_Id, d.Name, d.Discount_Type, d.Percentage, d.Applies_To, d.Starts_On, d.Ends_On, d.Is_Active,
           d.Created_At, d.Updated_At,
           (SELECT COUNT(*) FROM dbo.fn_Discount_Products() dp WHERE dp.Discount_Id = d.Discount_Id) AS Product_Count,
           (SELECT COUNT(*) FROM (
                SELECT a.Product_Id FROM dbo.DiscountAppliedProducts a WHERE a.Discount_Id = d.Discount_Id
                UNION
                SELECT v.Product_Id FROM dbo.DiscountAppliedVariants v WHERE v.Discount_Id = d.Discount_Id
            ) live) AS Live_Count
    FROM dbo.Discounts d
    ORDER BY d.Is_Active DESC, d.Created_At DESC;

    SELECT t.Discount_Id, t.Target_Id
    FROM dbo.DiscountTargets t
    ORDER BY t.Discount_Id, t.Target_Id;

    SELECT i.Discount_Id, i.Product_Id, i.Variant_Id, i.New_Price
    FROM dbo.DiscountItems i
    ORDER BY i.Discount_Id, i.Product_Id, i.Variant_Id;
END
GO
