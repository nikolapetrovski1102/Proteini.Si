SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_FavoriteProduct_Remove
    @UserId INT,
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DELETE FROM dbo.FavoriteProducts WHERE UserId = @UserId AND ProductId = @ProductId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
