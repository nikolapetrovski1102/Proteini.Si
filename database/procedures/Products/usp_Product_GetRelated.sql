SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetRelated
    @ProductId INT,
    @Limit INT
AS
BEGIN
    SET NOCOUNT ON;

    WITH CurrentCategories AS (
        SELECT Category_Id
        FROM dbo.ProductCategoryMapping
        WHERE Product_Id = @ProductId
    ),
    OrderCounts AS (
        SELECT Product_Id, SUM(Quantity) AS OrderCount
        FROM dbo.OrderItems
        WHERE Product_Id IS NOT NULL
        GROUP BY Product_Id
    )
    SELECT TOP (@Limit)
        p.Product_Id,
        p.Name,
        p.Img,
        CAST(p.Price AS decimal(18, 2)) AS Price,
        ISNULL(oc.OrderCount, 0) AS OrderCount
    FROM dbo.Products p
    LEFT JOIN OrderCounts oc ON oc.Product_Id = p.Product_Id
    WHERE p.Product_Id <> @ProductId
      AND EXISTS (
          SELECT 1
          FROM dbo.ProductCategoryMapping pcm
          INNER JOIN CurrentCategories cc ON cc.Category_Id = pcm.Category_Id
          WHERE pcm.Product_Id = p.Product_Id
      )
    ORDER BY
        ISNULL(oc.OrderCount, 0) DESC,
        p.CreatedAt DESC,
        p.Product_Id DESC;
END
GO
