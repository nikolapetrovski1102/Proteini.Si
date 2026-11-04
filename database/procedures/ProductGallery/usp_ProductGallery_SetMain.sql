SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductGallery_SetMain
    @GalleryId INT,
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ImagePath NVARCHAR(MAX);

    SELECT @ImagePath = Image_Path
    FROM dbo.ProductGallery
    WHERE Gallery_Id = @GalleryId AND Product_Id = @ProductId;

    IF @ImagePath IS NULL
    BEGIN
        SELECT CAST(0 AS bit);
        RETURN;
    END

    UPDATE dbo.Products SET Img = @ImagePath WHERE Product_Id = @ProductId;

    SELECT CAST(1 AS bit);
END
GO
