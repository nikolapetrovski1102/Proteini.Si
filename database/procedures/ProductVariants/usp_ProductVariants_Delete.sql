SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

        DECLARE @ProductId INT, @IsDefault BIT, @ImagePath NVARCHAR(MAX);

        SELECT @ProductId = Product_Id, @IsDefault = IsDefault, @ImagePath = Variant_Image_Path
        FROM dbo.ProductVariants WITH (UPDLOCK, HOLDLOCK)
        WHERE Variant_Id = @Id;

        IF @ProductId IS NULL
        BEGIN
            COMMIT TRANSACTION;
            RETURN;
        END

        UPDATE dbo.ProductVariants SET IsActive = 0 WHERE Variant_Id = @Id;

        IF NOT EXISTS (SELECT 1 FROM dbo.ProductVariants WHERE Product_Id = @ProductId AND IsActive = 1)
            UPDATE dbo.Products SET HasVariants = 0, Default_Variant_Id = NULL WHERE Product_Id = @ProductId;
        ELSE IF @IsDefault = 1
            UPDATE TOP (1) dbo.ProductVariants
            SET IsDefault = 1
            WHERE Product_Id = @ProductId AND IsActive = 1 AND Variant_Id != @Id;

    COMMIT TRANSACTION;

    SELECT @ImagePath AS ImagePath;
END
GO
