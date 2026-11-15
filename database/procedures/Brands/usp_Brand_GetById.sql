SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Brand_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Brand_Id, b.Brand_Name, b.Brand_Slug, b.Logo_Url, b.Header_Image_Url, b.Is_Featured,
        ISNULL(b.Display_Order, 0) AS Display_Order,
        (SELECT COUNT(*) FROM dbo.Products p WHERE p.Brand_Id = b.Brand_Id) AS Product_Count
    FROM dbo.Brands b
    WHERE b.Brand_Id = @Id;
END
GO
