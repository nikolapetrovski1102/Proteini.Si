SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LandingPageSection_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, SectionType, Title, ImagePath, Content, DisplayOrder, IsActive, CreatedAt
    FROM dbo.LandingPageSections
    ORDER BY DisplayOrder ASC, CreatedAt DESC;
END
GO
