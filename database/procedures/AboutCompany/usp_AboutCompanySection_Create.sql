SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_AboutCompanySection_Create
    @SectionType NVARCHAR(4000),
    @Title NVARCHAR(4000) = NULL,
    @VideoUrl NVARCHAR(4000) = NULL,
    @VideoThumbnailPath NVARCHAR(4000) = NULL,
    @Content NVARCHAR(MAX) = NULL,
    @DisplayOrder INT = 0,
    @CreatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @DisplayOrder <= 0
        SELECT @DisplayOrder = ISNULL(MAX(DisplayOrder), -1) + 1 FROM dbo.AboutCompanySections;

    INSERT INTO dbo.AboutCompanySections (SectionType, Title, VideoUrl, VideoThumbnailPath, Content, DisplayOrder, CreatedBy)
    VALUES (@SectionType, @Title, @VideoUrl, @VideoThumbnailPath, @Content, @DisplayOrder, @CreatedBy);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
