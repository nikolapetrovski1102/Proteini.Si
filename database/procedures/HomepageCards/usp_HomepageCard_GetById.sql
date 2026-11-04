SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive
    FROM dbo.HomepageCards
    WHERE Id = @Id;
END
GO
