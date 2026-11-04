SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_AboutCompanySection_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, SectionType, Title, VideoUrl, VideoThumbnailPath, Content, DisplayOrder, IsActive, CreatedAt
    FROM dbo.AboutCompanySections
    ORDER BY DisplayOrder ASC, CreatedAt DESC;
END
GO
