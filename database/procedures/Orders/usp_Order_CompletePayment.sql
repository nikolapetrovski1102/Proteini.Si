SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_CompletePayment
    @OrderId INT,
    @TransactionId NVARCHAR(4000) = NULL,
    @OrderStatus NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @Found BIT = 0, @PaymentStatus NVARCHAR(4000), @CurrentStatus NVARCHAR(4000),
            @Subtotal DECIMAL(38, 10), @UserId INT, @PaymentMethod NVARCHAR(50);

    SELECT
        @Found = 1,
        @PaymentStatus = Payment_Status,
        @CurrentStatus = Order_Status,
        @Subtotal = Subtotal,
        @UserId = User_Id,
        @PaymentMethod = Payment_Method
    FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK)
    WHERE Order_Id = @OrderId;

    IF @Found = 0
    BEGIN
        COMMIT TRANSACTION;
        SELECT 0 AS Result;
        RETURN;
    END

    IF LOWER(@PaymentStatus) = 'completed'
    BEGIN
        IF LOWER(@OrderStatus) = 'completed' AND ISNULL(LOWER(@CurrentStatus), '') <> 'completed'
            UPDATE dbo.Orders
            SET Order_Status = 'completed', Updated_At = GETDATE()
            WHERE Order_Id = @OrderId;

        COMMIT TRANSACTION;
        SELECT 1 AS Result;
        RETURN;
    END

    UPDATE dbo.Orders
    SET Payment_Status = 'completed',
        Transaction_Id = COALESCE(@TransactionId, Transaction_Id),
        Order_Status = @OrderStatus,
        Updated_At = GETDATE()
    WHERE Order_Id = @OrderId;

    -- Card orders leave the cart intact at creation; remove the purchased items once payment is confirmed.
    IF @UserId IS NOT NULL AND LOWER(@PaymentMethod) = 'credit_card'
        DELETE ci
        FROM dbo.CartItems ci
        INNER JOIN dbo.ShoppingCart sc ON sc.Cart_Id = ci.Cart_Id
        WHERE sc.User_Id = @UserId
          AND EXISTS (
              SELECT 1 FROM dbo.OrderItems oi
              WHERE oi.Order_Id = @OrderId
                AND oi.Product_Id = ci.Product_Id
                AND ISNULL(oi.Variant_Id, -1) = ISNULL(ci.Variant_Id, -1)
          );

    UPDATE dbo.GiftVoucherRedemptions
    SET Status = 'redeemed', CompletedAt = SYSUTCDATETIME()
    WHERE OrderId = @OrderId AND Status = 'reserved';

    DECLARE @Units TABLE (OrderItemId INT, Value DECIMAL(38, 10), UnitSequence INT, Email NVARCHAR(4000));

    INSERT INTO @Units (OrderItemId, Value, UnitSequence, Email)
    SELECT oi.OrderItem_Id, oi.Product_Price, n.UnitSequence, o.Billing_Email
    FROM dbo.OrderItems oi
    INNER JOIN dbo.Products p ON p.Product_Id = oi.Product_Id AND p.IsGiftVoucher = 1
    INNER JOIN dbo.Orders o ON o.Order_Id = oi.Order_Id
    CROSS APPLY (
        SELECT TOP (CASE WHEN oi.Quantity > 0 THEN oi.Quantity ELSE 0 END)
            ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS UnitSequence
        FROM sys.all_objects
    ) n
    WHERE oi.Order_Id = @OrderId;

    INSERT INTO dbo.GiftVouchers
        (Code, InitialValue, RemainingValue, Currency, Status, PurchasedOrderId,
         PurchasedOrderItemId, UnitSequence, PurchaserEmail, RecipientEmail,
         ValidFrom, ExpiresAt, CreatedAt, UpdatedAt)
    SELECT
        CONCAT('PTV-', CONVERT(VARCHAR(20), CRYPT_GEN_RANDOM(10), 2)),
        u.Value, u.Value, 'MKD', 'active', @OrderId,
        u.OrderItemId, u.UnitSequence, u.Email, u.Email,
        SYSUTCDATETIME(), NULL, SYSUTCDATETIME(), SYSUTCDATETIME()
    FROM @Units u
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.GiftVouchers gv WITH (UPDLOCK, HOLDLOCK)
        WHERE gv.PurchasedOrderItemId = u.OrderItemId AND gv.UnitSequence = u.UnitSequence
    );

    IF @UserId IS NOT NULL
    BEGIN
        DECLARE @Points DECIMAL(38, 0) = FLOOR(@Subtotal * 0.02);

        IF @Points > 0 AND NOT EXISTS (
            SELECT 1 FROM dbo.LoyaltyPoints WITH (UPDLOCK, HOLDLOCK)
            WHERE UserId = @UserId
              AND PointsType = 'earned'
              AND SourceType = 'order'
              AND SourceId = @OrderId
        )
            INSERT INTO dbo.LoyaltyPoints
                (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate, ExpiryDate)
            VALUES
                (@UserId, @Points, 'earned', 'order', @OrderId,
                 CONCAT(N'Earned ', CONVERT(NVARCHAR(40), @Points), N' points from order #', @OrderId),
                 GETDATE(), DATEADD(MONTH, 12, GETDATE()));
    END

    COMMIT TRANSACTION;
    SELECT 2 AS Result;
END
GO
