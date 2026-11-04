SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_SetImage
    @ProductId INT,
    @Img NVARCHAR(MAX) = NULL,
    @TouchUpdatedAt BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Products
    SET Img = @Img,
        UpdatedAt = CASE WHEN @TouchUpdatedAt = 1 THEN GETDATE() ELSE UpdatedAt END
    OUTPUT deleted.Img AS OldImg, inserted.Img AS NewImg
    WHERE Product_Id = @ProductId;
END
GO
