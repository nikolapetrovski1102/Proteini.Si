SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Product_BulkSetQuantity
    @ProductIds dbo.IntList READONLY,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ProductsAffected INT, @VariantsAffected INT;

    BEGIN TRANSACTION;

        UPDATE dbo.Products
        SET Quantity = @Quantity, UpdatedAt = GETDATE()
        WHERE Product_Id IN (SELECT Id FROM @ProductIds);
        SET @ProductsAffected = @@ROWCOUNT;

        UPDATE dbo.ProductVariants
        SET Quantity = @Quantity, Updated_At = GETDATE()
        WHERE Product_Id IN (SELECT Id FROM @ProductIds) AND IsActive = 1;
        SET @VariantsAffected = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT @ProductsAffected AS ProductsAffected, @VariantsAffected AS VariantsAffected;
END
GO
