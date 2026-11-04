SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FavoriteProduct_GetByUser
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT fp.FavoriteId, fp.UserId, fp.ProductId, fp.CreatedAt,
           p.Name AS ProductName,
           p.Price AS ProductPrice,
           p.Img AS ProductImage
    FROM dbo.FavoriteProducts fp
    INNER JOIN dbo.Products p ON fp.ProductId = p.Product_Id
    WHERE fp.UserId = @UserId
    ORDER BY fp.CreatedAt DESC;
END
GO
