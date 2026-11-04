SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_VariantGallery_GetByVariant
    @VariantId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Gallery_Id, Variant_Id, Image_Path, Display_Order, IsMain, Created_At
    FROM dbo.VariantGallery
    WHERE Variant_Id = @VariantId
    ORDER BY IsMain DESC, Display_Order ASC, Gallery_Id ASC;
END
GO
