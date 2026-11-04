SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_YouTubeVideo_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE video
    SET DisplayOrder = item.DisplayOrder,
        UpdatedAt = GETDATE()
    FROM dbo.YouTubeVideos video
    JOIN @Items item ON item.Id = video.Id;
END
GO
