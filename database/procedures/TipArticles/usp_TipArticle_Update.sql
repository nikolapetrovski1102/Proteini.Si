SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_Update
    @Id INT,
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

    UPDATE dbo.TipArticles
    SET Category = @Category,
        Title = @Title,
        TitleAl = @TitleAl,
        Subtitle = @Subtitle,
        SubtitleAl = @SubtitleAl,
        Content = @Content,
        ContentAl = @ContentAl,
        Slug = @Slug,
        SeoTitle = @SeoTitle,
        SeoDescription = @SeoDescription,
        ImagePath = @ImagePath,
        DisplayOrder = @DisplayOrder,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE Id = @Id;
END
GO
