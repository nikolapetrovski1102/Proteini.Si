CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.TipArticles
    WHERE IsActive = 1
    ORDER BY DisplayOrder, CreatedAt DESC;
END
GO
