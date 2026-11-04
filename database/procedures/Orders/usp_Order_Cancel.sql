SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_Cancel
    @OrderId INT,
    @UserId INT,
    @Now DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @Found BIT = 0, @OrderNumber NVARCHAR(50), @OrderDate DATETIME, @OrderStatus NVARCHAR(4000),
            @PointsRedeemed DECIMAL(10, 2), @UserEmail NVARCHAR(4000), @UserFullName NVARCHAR(4000), @Result INT;

    SELECT
        @Found = 1,
        @OrderNumber = o.Order_Number,
        @OrderDate = o.Order_Date,
        @OrderStatus = o.Order_Status,
        @PointsRedeemed = o.Points_Redeemed,
        @UserEmail = u.User_Email,
        @UserFullName = u.User_FullName
    FROM dbo.Orders o WITH (UPDLOCK, HOLDLOCK)
    INNER JOIN dbo.[User] u ON o.User_Id = u.User_Id
    WHERE o.Order_Id = @OrderId AND o.User_Id = @UserId;

    IF @Found = 0
        SET @Result = 0;
    ELSE IF @OrderStatus COLLATE Latin1_General_BIN2 IN ('shipped', 'delivered', 'cancelled')
        SET @Result = 1;
    ELSE IF @Now > DATEADD(HOUR, 24, CAST(@OrderDate AS DATETIME2))
        SET @Result = 2;
    ELSE
    BEGIN
        UPDATE dbo.Orders
        SET Order_Status = 'cancelled',
            Payment_Status = CASE
                WHEN Payment_Status IN ('pending', 'completed', 'paid') THEN 'refunded'
                ELSE Payment_Status
            END,
            Updated_At = GETDATE()
        WHERE Order_Id = @OrderId;

        EXEC dbo.usp_Order_ReleaseVoucher @OrderId = @OrderId;

        IF @PointsRedeemed IS NOT NULL AND @PointsRedeemed > 0
            INSERT INTO dbo.LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
            VALUES (@UserId, @PointsRedeemed, 'earned', 'refund', @OrderId,
                    CONCAT(N'Points refunded for cancelled order #', @OrderNumber), GETDATE());

        SET @Result = 3;
    END

    COMMIT TRANSACTION;

    SELECT
        @Result AS Result,
        @OrderStatus AS Order_Status,
        @OrderNumber AS Order_Number,
        @PointsRedeemed AS Points_Redeemed,
        @UserEmail AS User_Email,
        @UserFullName AS User_FullName;
END
GO
