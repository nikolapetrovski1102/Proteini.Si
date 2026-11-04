SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_Create
    @Category NVARCHAR(100),
    @Title NVARCHAR(300),
    @TitleAl NVARCHAR(300) = NULL,
    @Subtitle NVARCHAR(500) = NULL,
    @SubtitleAl NVARCHAR(1000) = NULL,
    @Content NVARCHAR(MAX) = NULL,
    @ContentAl NVARCHAR(MAX) = NULL,
    @Slug NVARCHAR(180),
    @SeoTitle NVARCHAR(300) = NULL,
    @SeoDescription NVARCHAR(500) = NULL,
    @ImagePath NVARCHAR(500) = NULL,
    @DisplayOrder INT = 0,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TipArticles (
        Category, Title, TitleAl, Subtitle, SubtitleAl, Content, ContentAl, Slug,
        SeoTitle, SeoDescription, ImagePath, DisplayOrder, IsActive, CreatedAt
    )
    VALUES (
        @Category, @Title, @TitleAl, @Subtitle, @SubtitleAl, @Content, @ContentAl, @Slug,
        @SeoTitle, @SeoDescription, @ImagePath, @DisplayOrder, @IsActive, GETDATE()
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
