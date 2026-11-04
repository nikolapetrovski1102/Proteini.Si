SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_GetActiveByType
    @Type NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
    FROM dbo.Partners
    WHERE Type = @Type AND IsActive = 1
    ORDER BY DisplayOrder ASC, CreatedAt DESC;
END
GO
