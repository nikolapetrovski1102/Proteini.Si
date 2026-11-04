SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductGallery_GetByProduct
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Gallery_Id, Product_Id, Image_Path, Display_Order, IsActive, Created_At
    FROM dbo.ProductGallery
    WHERE Product_Id = @ProductId AND IsActive = 1
    ORDER BY Display_Order ASC, Gallery_Id ASC;
END
GO
