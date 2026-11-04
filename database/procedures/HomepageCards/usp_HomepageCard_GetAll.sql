SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive
    FROM dbo.HomepageCards
    ORDER BY CASE WHEN Section = 'goal' THEN 0 ELSE 1 END, DisplayOrder, Id;
END
GO
