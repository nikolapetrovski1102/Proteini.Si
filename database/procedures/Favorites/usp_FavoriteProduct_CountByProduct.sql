SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FavoriteProduct_CountByProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1) FROM dbo.FavoriteProducts WHERE ProductId = @ProductId;
END
GO
