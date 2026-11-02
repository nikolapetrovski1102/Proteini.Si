CREATE OR ALTER PROCEDURE dbo.usp_TipArticle_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.TipArticles
    WHERE Id = @Id;
END
GO
