CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_SlugExists
    @Slug NVARCHAR(180),
    @ExcludingId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CAST(CASE WHEN EXISTS (
        SELECT 1
        FROM dbo.TipArticles
        WHERE Slug = @Slug
          AND (@ExcludingId IS NULL OR Id <> @ExcludingId)
    ) THEN 1 ELSE 0 END AS BIT) AS SlugExists;
END
GO
