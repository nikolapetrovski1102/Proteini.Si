SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_AboutCompanySection_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE section
    SET DisplayOrder = item.DisplayOrder,
        UpdatedAt = GETDATE()
    FROM dbo.AboutCompanySections section
    JOIN @Items item ON item.Id = section.Id;
END
GO
