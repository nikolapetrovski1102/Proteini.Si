SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_DynamicSection_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE section
    SET Display_Order = item.DisplayOrder,
        Updated_At = GETDATE()
    FROM dbo.DynamicSections section
    JOIN @Items item ON item.Id = section.Section_Id;
END
GO
