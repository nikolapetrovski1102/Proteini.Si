SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InstagramPost_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, PostUrl, ImagePath, Description, LikeCount, PostedBy, PostedDate, CreatedAt
    FROM dbo.InstagramPosts
    WHERE IsActive = 1
    ORDER BY CreatedAt DESC;
END
GO
