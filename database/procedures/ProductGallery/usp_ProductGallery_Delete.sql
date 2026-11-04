SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductGallery_Delete
    @GalleryId INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.ProductGallery
    OUTPUT deleted.Image_Path
    WHERE Gallery_Id = @GalleryId;
END
GO
