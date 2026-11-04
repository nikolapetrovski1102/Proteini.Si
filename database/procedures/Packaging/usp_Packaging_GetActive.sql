SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Packaging_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Packaging_Id, Packaging_Name, Packaging_Type, Weight_Grams, Quantity_Per_Box, Display_Order, IsActive, Created_At
    FROM dbo.Packaging
    WHERE IsActive = 1
    ORDER BY Display_Order ASC;
END
GO
