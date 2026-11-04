SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantGallery_SetMain
    @VariantId INT,
    @GalleryId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        UPDATE dbo.VariantGallery SET IsMain = 0 WHERE Variant_Id = @VariantId;
        UPDATE dbo.VariantGallery SET IsMain = 1 WHERE Gallery_Id = @GalleryId;

    COMMIT TRANSACTION;
END
GO
