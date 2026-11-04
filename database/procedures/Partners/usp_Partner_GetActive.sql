SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
    FROM dbo.Partners
    WHERE IsActive = 1
    ORDER BY Type, DisplayOrder ASC, CreatedAt DESC;
END
GO
