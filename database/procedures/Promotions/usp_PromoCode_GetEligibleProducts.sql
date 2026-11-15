SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Which of @ProductIds the promo code applies to. A category target also covers its subcategories.
CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_GetEligibleProducts
    @PromoCodeId INT,
    @ProductIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @AppliesTo NVARCHAR(20) = (SELECT AppliesTo FROM dbo.PromoCodes WHERE PromoCodeId = @PromoCodeId);

    IF @AppliesTo IS NULL
    BEGIN
        SELECT CAST(NULL AS INT) AS ProductId WHERE 1 = 0;
        RETURN;
    END

    IF @AppliesTo = N'all'
    BEGIN
        SELECT ids.Id AS ProductId FROM @ProductIds ids;
        RETURN;
    END

    IF @AppliesTo = N'products'
    BEGIN
        SELECT ids.Id AS ProductId
        FROM @ProductIds ids
        WHERE EXISTS (SELECT 1 FROM dbo.PromoCodeTargets t
                      WHERE t.PromoCodeId = @PromoCodeId AND t.TargetType = N'product' AND t.TargetId = ids.Id);
        RETURN;
    END

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
    SELECT ids.Id AS ProductId
    FROM @ProductIds ids
    WHERE EXISTS (SELECT 1 FROM dbo.ProductCategoryMapping m
                  INNER JOIN Tree ON Tree.Category_Id = m.Category_Id
                  WHERE m.Product_Id = ids.Id);
END
GO
