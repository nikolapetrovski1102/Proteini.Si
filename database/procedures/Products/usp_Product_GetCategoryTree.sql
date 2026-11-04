SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_GetCategoryTree
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Category_Id, Parent_Category_Id FROM dbo.ProductCategories;
END
GO
