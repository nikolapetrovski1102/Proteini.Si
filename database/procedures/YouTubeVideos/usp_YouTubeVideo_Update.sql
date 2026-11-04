SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_YouTubeVideo_Update
    @Id INT,
    @VideoUrl NVARCHAR(4000),
    @ThumbnailPath NVARCHAR(4000),
    @Title NVARCHAR(4000),
    @Description NVARCHAR(4000) = NULL,
    @ViewCount INT = 0,
    @LikeCount INT = 0,
    @DisplayOrder INT = 0,
    @UpdatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.YouTubeVideos
    SET VideoUrl = @VideoUrl,
        ThumbnailPath = @ThumbnailPath,
        Title = @Title,
        Description = @Description,
        ViewCount = @ViewCount,
        LikeCount = @LikeCount,
        DisplayOrder = @DisplayOrder,
        UpdatedAt = GETDATE(),
        UpdatedBy = @UpdatedBy
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
