SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_YouTubeVideo_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, VideoUrl, ThumbnailPath, Title, Description, ViewCount, LikeCount, DisplayOrder, IsActive, CreatedAt
    FROM dbo.YouTubeVideos
    WHERE Id = @Id;
END
GO
