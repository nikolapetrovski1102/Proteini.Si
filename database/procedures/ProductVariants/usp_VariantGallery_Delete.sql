SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantGallery_Delete
    @GalleryId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        DECLARE @Deleted TABLE (Image_Path NVARCHAR(500), Variant_Id INT, IsMain BIT);

        DELETE FROM dbo.VariantGallery
        OUTPUT deleted.Image_Path, deleted.Variant_Id, deleted.IsMain INTO @Deleted
        WHERE Gallery_Id = @GalleryId;

        IF EXISTS (SELECT 1 FROM @Deleted WHERE IsMain = 1)
            UPDATE TOP (1) dbo.VariantGallery
            SET IsMain = 1
            WHERE Variant_Id = (SELECT Variant_Id FROM @Deleted);

    COMMIT TRANSACTION;

    SELECT Image_Path AS ImagePath FROM @Deleted;
END
GO
