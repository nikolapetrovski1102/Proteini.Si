SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE partner
    SET DisplayOrder = item.DisplayOrder,
        UpdatedAt = GETDATE()
    FROM dbo.Partners partner
    JOIN @Items item ON item.Id = partner.Id;
END
GO
