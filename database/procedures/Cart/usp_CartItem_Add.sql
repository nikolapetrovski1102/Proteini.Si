SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 saved, 1 insufficient stock (RequestedQuantity holds the quantity that was rejected)
CREATE OR ALTER PROCEDURE dbo.usp_CartItem_Add
    @CartId INT,
    @ProductId INT,
    @VariantId INT,
    @IsGiftVoucher BIT,
    @Price DECIMAL(38,10),
    @Quantity INT,
    @AvailableQuantity INT,
    @VariantName NVARCHAR(4000),
    @VariantPackaging NVARCHAR(4000),
    @DisplayName NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @CartItemId INT, @ExistingQuantity INT;

    SELECT TOP 1 @CartItemId = CartItem_Id, @ExistingQuantity = Quantity
    FROM dbo.CartItems WITH (UPDLOCK, HOLDLOCK)
    WHERE Cart_Id = @CartId
      AND Product_Id = @ProductId
      AND ((@VariantId IS NULL AND Variant_Id IS NULL) OR (Variant_Id = @VariantId))
      AND (@IsGiftVoucher = 0 OR Price = @Price)
    ORDER BY CartItem_Id;

    DECLARE @RequestedQuantity INT = COALESCE(@ExistingQuantity, 0) + @Quantity;

    IF @RequestedQuantity > @AvailableQuantity
    BEGIN
        COMMIT TRANSACTION;
        SELECT 1 AS Result, @RequestedQuantity AS RequestedQuantity;
        RETURN;
    END

    IF @CartItemId IS NOT NULL
        UPDATE dbo.CartItems
        SET Quantity = @RequestedQuantity,
            Price = @Price,
            Variant_Name = @VariantName,
            Variant_Packaging = @VariantPackaging,
            Display_Name = @DisplayName,
            UpdatedAt = GETDATE()
        WHERE CartItem_Id = @CartItemId;
    ELSE
        INSERT INTO dbo.CartItems (
            Cart_Id, Product_Id, Variant_Id, Variant_Name, Variant_Packaging,
            Quantity, Price, Display_Name, CreatedAt, UpdatedAt)
        VALUES (
            @CartId, @ProductId, @VariantId, @VariantName, @VariantPackaging,
            @Quantity, @Price, @DisplayName, GETDATE(), GETDATE());

    COMMIT TRANSACTION;

    SELECT 0 AS Result, @RequestedQuantity AS RequestedQuantity;
END
GO
