SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductGallery_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE g
    SET Display_Order = i.DisplayOrder
    FROM dbo.ProductGallery g
    INNER JOIN @Items i ON i.Id = g.Gallery_Id;
END
GO
