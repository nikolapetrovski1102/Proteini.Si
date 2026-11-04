SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductCategory_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Category_Id, Category_Name, Category_Slug, Parent_Category_Id, Display_Order
    FROM dbo.ProductCategories
    ORDER BY CASE WHEN Parent_Category_Id IS NULL THEN Category_Id ELSE Parent_Category_Id END,
             Parent_Category_Id, Display_Order, Category_Name;
END
GO
