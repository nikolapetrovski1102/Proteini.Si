SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
    FROM dbo.Partners
    ORDER BY Type, DisplayOrder ASC, CreatedAt DESC;
END
GO
