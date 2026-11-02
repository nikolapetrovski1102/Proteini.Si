CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.TipArticles
    ORDER BY DisplayOrder, CreatedAt DESC;
END
GO
