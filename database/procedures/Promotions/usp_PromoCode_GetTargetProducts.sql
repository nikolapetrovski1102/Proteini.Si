SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Every product a "products" or "categories" promo code applies to, so the shop can show the
-- code's price on product cards. A category target also covers its subcategories.
-- Returns nothing for an "all products" code (the caller treats that as every product).
CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_GetTargetProducts
    @PromoCodeId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AppliesTo NVARCHAR(20) = (SELECT AppliesTo FROM dbo.PromoCodes WHERE PromoCodeId = @PromoCodeId);

    IF @AppliesTo = N'products'
    BEGIN
        SELECT DISTINCT t.TargetId AS ProductId
        FROM dbo.PromoCodeTargets t
        WHERE t.PromoCodeId = @PromoCodeId AND t.TargetType = N'product';
        RETURN;
    END

    IF @AppliesTo = N'categories'
    BEGIN
        ;WITH Tree AS (
            SELECT c.Category_Id, 0 AS Depth
            FROM dbo.ProductCategories c
            INNER JOIN dbo.PromoCodeTargets t
                ON t.PromoCodeId = @PromoCodeId AND t.TargetType = N'category' AND t.TargetId = c.Category_Id
            UNION ALL
            SELECT child.Category_Id, Tree.Depth + 1
            FROM dbo.ProductCategories child
            INNER JOIN Tree ON child.Parent_Category_Id = Tree.Category_Id
            WHERE Tree.Depth < 10
        )
        SELECT DISTINCT m.Product_Id AS ProductId
        FROM dbo.ProductCategoryMapping m
        INNER JOIN Tree ON Tree.Category_Id = m.Category_Id;
        RETURN;
    END

    SELECT CAST(NULL AS INT) AS ProductId WHERE 1 = 0;
END
GO
