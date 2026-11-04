SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantGallery_Create
    @VariantId INT,
    @ImagePath NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        DECLARE @ImageCount INT = (
            SELECT COUNT(1) FROM dbo.VariantGallery WITH (UPDLOCK, HOLDLOCK) WHERE Variant_Id = @VariantId
        );
        DECLARE @IsMain BIT = CASE WHEN @ImageCount = 0 THEN 1 ELSE 0 END;

        INSERT INTO dbo.VariantGallery (Variant_Id, Image_Path, Display_Order, IsMain, Created_At)
        VALUES (@VariantId, @ImagePath, @ImageCount, @IsMain, GETDATE());

        DECLARE @GalleryId INT = CAST(SCOPE_IDENTITY() AS int);

    COMMIT TRANSACTION;

    SELECT @GalleryId AS GalleryId, @IsMain AS IsMain;
END
GO
