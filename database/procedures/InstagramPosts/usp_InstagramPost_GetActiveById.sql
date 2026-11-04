SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_InstagramPost_GetActiveById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, PostUrl, ImagePath, Description, LikeCount, PostedBy, PostedDate, CreatedAt
    FROM dbo.InstagramPosts
    WHERE Id = @Id AND IsActive = 1;
END
GO
