SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Called by the Instagram feed sync. Posts are matched by their shortcode in PostUrl, so rows
-- added by hand (with ?utm_source=… links) are updated too. Rows an admin removed stay removed:
-- IsActive is never touched. Returns the row Id and whether it was inserted.
CREATE OR ALTER PROCEDURE dbo.usp_InstagramPost_UpsertFromFeed
    @ShortCode NVARCHAR(100),
    @PostUrl NVARCHAR(4000),
    @ImagePath NVARCHAR(4000),
    @Description NVARCHAR(4000) = NULL,
    @LikeCount INT = NULL,
    @PostedBy NVARCHAR(4000) = NULL,
    @PostedDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Pattern NVARCHAR(200) =
        N'%/' + REPLACE(REPLACE(REPLACE(@ShortCode, N'[', N'[[]'), N'_', N'[_]'), N'%', N'[%]') + N'[/?]%';
    DECLARE @Id INT;

    BEGIN TRANSACTION;

    SELECT TOP (1) @Id = Id
    FROM dbo.InstagramPosts WITH (UPDLOCK, HOLDLOCK)
    WHERE PostUrl LIKE @Pattern OR PostUrl LIKE N'%/' + @ShortCode
    ORDER BY IsActive DESC, Id DESC;

    IF @Id IS NULL
    BEGIN
        INSERT INTO dbo.InstagramPosts (PostUrl, ImagePath, Description, LikeCount, PostedBy, PostedDate, CreatedBy)
        VALUES (@PostUrl, @ImagePath, @Description, COALESCE(@LikeCount, 0), @PostedBy, @PostedDate, N'instagram-sync');

        COMMIT TRANSACTION;
        SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id, CAST(1 AS BIT) AS Inserted;
        RETURN;
    END

    UPDATE dbo.InstagramPosts
    SET ImagePath = @ImagePath,
        Description = COALESCE(@Description, Description),
        LikeCount = COALESCE(@LikeCount, LikeCount),
        PostedBy = COALESCE(@PostedBy, PostedBy),
        PostedDate = COALESCE(@PostedDate, PostedDate),
        UpdatedAt = GETDATE(),
        UpdatedBy = N'instagram-sync'
    WHERE Id = @Id;

    COMMIT TRANSACTION;
    SELECT @Id AS Id, CAST(0 AS BIT) AS Inserted;
END
GO
