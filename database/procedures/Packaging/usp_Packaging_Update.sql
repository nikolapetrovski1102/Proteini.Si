SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Packaging_Update
    @Packaging_Id INT,
    @Packaging_Name NVARCHAR(4000),
    @Packaging_Type NVARCHAR(4000) = NULL,
    @Weight_Grams DECIMAL(38, 10) = NULL,
    @Quantity_Per_Box INT = NULL,
    @Display_Order INT = 0,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.Packaging
    SET Packaging_Name = @Packaging_Name,
        Packaging_Type = @Packaging_Type,
        Weight_Grams = @Weight_Grams,
        Quantity_Per_Box = @Quantity_Per_Box,
        Display_Order = @Display_Order,
        IsActive = @IsActive
    WHERE Packaging_Id = @Packaging_Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
