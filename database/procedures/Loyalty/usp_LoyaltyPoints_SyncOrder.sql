SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Keeps the "earned" loyalty row of one order in line with the order's status:
--   * accepted orders (confirmed, processing, paid, completed, shipped, delivered) earn their points once,
--     for card and cash-on-delivery alike;
--   * cancelled, rejected and refunded orders lose the points they earned.
-- Points are the per-item LoyaltyPointsEarned stored at checkout (product/variant percentage), falling back
-- to 2% of the item subtotal for old items without a stored value. Idempotent; returns no result set, so it
-- can run inside other order procedures.
CREATE OR ALTER PROCEDURE dbo.usp_LoyaltyPoints_SyncOrder
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @UserId INT, @Status NVARCHAR(50), @OrderNumber NVARCHAR(50);

    SELECT @UserId = User_Id, @Status = LOWER(LTRIM(RTRIM(Order_Status))), @OrderNumber = Order_Number
    FROM dbo.Orders
    WHERE Order_Id = @OrderId;

    IF @UserId IS NULL
        RETURN;

    IF @Status IN ('cancelled', 'rejected', 'refunded')
    BEGIN
        DELETE FROM dbo.LoyaltyPoints
        WHERE UserId = @UserId AND PointsType = 'earned' AND SourceType = 'order' AND SourceId = @OrderId;
        RETURN;
    END

    IF @Status NOT IN ('confirmed', 'processing', 'paid', 'completed', 'shipped', 'delivered')
        RETURN;

    IF EXISTS (
        SELECT 1 FROM dbo.LoyaltyPoints WITH (UPDLOCK, HOLDLOCK)
        WHERE UserId = @UserId AND PointsType = 'earned' AND SourceType = 'order' AND SourceId = @OrderId
    )
        RETURN;

    DECLARE @Points DECIMAL(10, 2) = (
        SELECT ISNULL(SUM(ISNULL(CAST(oi.LoyaltyPointsEarned AS DECIMAL(38, 10)), FLOOR(oi.Subtotal * 0.02))), 0)
        FROM dbo.OrderItems oi
        WHERE oi.Order_Id = @OrderId
    );

    IF @Points <= 0
        RETURN;

    INSERT INTO dbo.LoyaltyPoints
        (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate, ExpiryDate)
    VALUES
        (@UserId, @Points, 'earned', 'order', @OrderId,
         CONCAT(N'Earned ', CONVERT(NVARCHAR(40), CAST(@Points AS INT)), N' points from order #', @OrderNumber),
         GETDATE(), DATEADD(MONTH, 12, GETDATE()));
END
GO
