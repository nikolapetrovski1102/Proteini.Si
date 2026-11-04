SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_CategorySlugHistory_Resolve
    @Slug NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 c.Category_Id, c.Category_Slug
    FROM dbo.CategorySlugHistory h
    INNER JOIN dbo.ProductCategories c ON c.Category_Id = h.CategoryId
    WHERE h.OldSlug = @Slug;
END
GO
