SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InstagramPost_Update
    @Id INT,
    @PostUrl NVARCHAR(4000),
    @ImagePath NVARCHAR(4000),
    @Description NVARCHAR(4000) = NULL,
    @LikeCount INT = 0,
    @PostedBy NVARCHAR(4000) = NULL,
    @PostedDate DATETIME = NULL,
    @UpdatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.InstagramPosts
    SET PostUrl = @PostUrl,
        ImagePath = @ImagePath,
        Description = @Description,
        LikeCount = @LikeCount,
        PostedBy = @PostedBy,
        PostedDate = @PostedDate,
        UpdatedAt = GETDATE(),
        UpdatedBy = @UpdatedBy
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
