SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_AboutCompanySection_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, SectionType, Title, VideoUrl, VideoThumbnailPath, Content, DisplayOrder, IsActive, CreatedAt
    FROM dbo.AboutCompanySections
    WHERE Id = @Id;
END
GO
