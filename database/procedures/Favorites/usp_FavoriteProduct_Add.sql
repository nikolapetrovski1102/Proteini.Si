SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FavoriteProduct_Add
    @UserId INT,
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.FavoriteProducts WITH (UPDLOCK, HOLDLOCK) WHERE UserId = @UserId AND ProductId = @ProductId)
    BEGIN
        COMMIT TRANSACTION;
        SELECT CAST(NULL AS INT) AS FavoriteId;
        RETURN;
    END

    INSERT INTO dbo.FavoriteProducts (UserId, ProductId, CreatedAt)
    VALUES (@UserId, @ProductId, GETDATE());

    DECLARE @FavoriteId INT = CAST(SCOPE_IDENTITY() AS INT);

    COMMIT TRANSACTION;

    SELECT @FavoriteId AS FavoriteId,
           p.Name AS ProductName,
           p.Price AS ProductPrice,
           p.Img AS ProductImage
    FROM (SELECT 1 AS One) x
    LEFT JOIN dbo.Products p ON p.Product_Id = @ProductId;
END
GO
