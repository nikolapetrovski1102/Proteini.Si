CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_GetActiveBySlug
    @Slug NVARCHAR(180)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.TipArticles
    WHERE Slug = @Slug
      AND IsActive = 1;
END
GO
