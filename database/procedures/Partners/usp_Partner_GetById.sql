SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Type, Name, ImagePath, Url, DisplayOrder, IsActive, CreatedAt
    FROM dbo.Partners
    WHERE Id = @Id;
END
GO
