SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductGallery_Create
    @ProductId INT,
    @ImagePath NVARCHAR(MAX),
    @DisplayOrder INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        IF @DisplayOrder IS NULL
            SELECT @DisplayOrder = ISNULL(MAX(Display_Order), -1) + 1
            FROM dbo.ProductGallery WITH (UPDLOCK, HOLDLOCK)
            WHERE Product_Id = @ProductId;

        INSERT INTO dbo.ProductGallery (Product_Id, Image_Path, Display_Order, IsActive, Created_At)
        VALUES (@ProductId, @ImagePath, @DisplayOrder, 1, GETDATE());

        DECLARE @GalleryId INT = CAST(SCOPE_IDENTITY() AS int);

    COMMIT TRANSACTION;

    SELECT @GalleryId AS GalleryId, @DisplayOrder AS DisplayOrder;
END
GO
