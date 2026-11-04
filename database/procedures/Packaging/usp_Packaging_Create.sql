SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Packaging_Create
    @Packaging_Name NVARCHAR(4000),
    @Packaging_Type NVARCHAR(4000) = NULL,
    @Weight_Grams DECIMAL(38, 10) = NULL,
    @Quantity_Per_Box INT = NULL,
    @Display_Order INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    INSERT INTO dbo.Packaging (Packaging_Name, Packaging_Type, Weight_Grams, Quantity_Per_Box, Display_Order, IsActive, Created_At)
    VALUES (@Packaging_Name, @Packaging_Type, @Weight_Grams, @Quantity_Per_Box, @Display_Order, 1, GETDATE());

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
