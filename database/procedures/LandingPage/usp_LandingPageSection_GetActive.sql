SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LandingPageSection_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, SectionType, Title, ImagePath, Content, DisplayOrder, IsActive, CreatedAt
    FROM dbo.LandingPageSections
    WHERE IsActive = 1
    ORDER BY DisplayOrder ASC, CreatedAt DESC;
END
GO
