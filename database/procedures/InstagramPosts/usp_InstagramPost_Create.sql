SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InstagramPost_Create
    @PostUrl NVARCHAR(4000),
    @ImagePath NVARCHAR(4000),
    @Description NVARCHAR(4000) = NULL,
    @LikeCount INT = 0,
    @PostedBy NVARCHAR(4000) = NULL,
    @PostedDate DATETIME = NULL,
    @CreatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    INSERT INTO dbo.InstagramPosts (PostUrl, ImagePath, Description, LikeCount, PostedBy, PostedDate, CreatedBy)
    VALUES (@PostUrl, @ImagePath, @Description, @LikeCount, @PostedBy, @PostedDate, @CreatedBy);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
