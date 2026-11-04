SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_YouTubeVideo_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, VideoUrl, ThumbnailPath, Title, Description, ViewCount, LikeCount, DisplayOrder, IsActive, CreatedAt
    FROM dbo.YouTubeVideos
    WHERE IsActive = 1
    ORDER BY DisplayOrder ASC, CreatedAt DESC;
END
GO
