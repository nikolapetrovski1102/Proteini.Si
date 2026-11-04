SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_YouTubeVideo_Create
    @VideoUrl NVARCHAR(4000),
    @ThumbnailPath NVARCHAR(4000),
    @Title NVARCHAR(4000),
    @Description NVARCHAR(4000) = NULL,
    @ViewCount INT = 0,
    @LikeCount INT = 0,
    @DisplayOrder INT = 0,
    @CreatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @DisplayOrder <= 0
        SELECT @DisplayOrder = ISNULL(MAX(DisplayOrder), -1) + 1 FROM dbo.YouTubeVideos;

    INSERT INTO dbo.YouTubeVideos (VideoUrl, ThumbnailPath, Title, Description, ViewCount, LikeCount, DisplayOrder, CreatedBy)
    VALUES (@VideoUrl, @ThumbnailPath, @Title, @Description, @ViewCount, @LikeCount, @DisplayOrder, @CreatedBy);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
