-- One-off: give loyalty points for accepted orders that never earned them.
--
-- Before 2026-11-11 points were only written when an order was marked paid/completed (card payments), so
-- cash-on-delivery orders and admin-confirmed card orders earned nothing. usp_LoyaltyPoints_SyncOrder now
-- handles new status changes; this script catches up the past.
--
-- Rules (same as usp_LoyaltyPoints_SyncOrder):
--   * order belongs to an account and is confirmed / processing / paid / completed / shipped / delivered;
--   * no "earned" row exists for the order yet (safe to re-run);
--   * points = stored per-item LoyaltyPointsEarned, or 2% of the item subtotal for old items;
--   * dated on the order date, expiring 12 months after it (orders older than 12 months give nothing).
--
-- Options below. Run with @DryRun = 1 first: it only lists what would change.
-- Every inserted row and every linked guest order is recorded in dbo.LoyaltyBackfill_20261111 so the run
-- can be undone (see the bottom of the file).

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @DryRun BIT = 1;
-- Old-site cash orders were never moved out of "pending". 1 = treat them as fulfilled.
DECLARE @IncludePendingCash BIT = 0;
-- 1 = attach guest orders to the account with the same email (they then show in that customer's order history).
DECLARE @LinkGuestOrdersByEmail BIT = 0;
-- Internal/test accounts that must not get points (comma separated User_Id values).
DECLARE @ExcludeUserIds NVARCHAR(400) = N'1,4,8,11';

DECLARE @Excluded TABLE (UserId INT PRIMARY KEY);
INSERT INTO @Excluded (UserId)
SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT) FROM STRING_SPLIT(@ExcludeUserIds, ',')
WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL;

DECLARE @Candidates TABLE (
    OrderId INT PRIMARY KEY, OrderNumber NVARCHAR(50), OrderDate DATETIME, OrderStatus NVARCHAR(50),
    PaymentMethod NVARCHAR(50), UserId INT, LinkedByEmail BIT, Points DECIMAL(10, 2));

INSERT INTO @Candidates
SELECT o.Order_Id, o.Order_Number, o.Order_Date, o.Order_Status, o.Payment_Method,
       COALESCE(o.User_Id, m.User_Id), CASE WHEN o.User_Id IS NULL THEN 1 ELSE 0 END,
       (SELECT ISNULL(SUM(ISNULL(CAST(oi.LoyaltyPointsEarned AS DECIMAL(38, 10)), FLOOR(oi.Subtotal * 0.02))), 0)
        FROM dbo.OrderItems oi WHERE oi.Order_Id = o.Order_Id)
FROM dbo.Orders o
OUTER APPLY (
    -- only an unambiguous match: exactly one account with this email
    SELECT MIN(u.User_Id) AS User_Id FROM dbo.[User] u
    WHERE @LinkGuestOrdersByEmail = 1 AND o.User_Id IS NULL
      AND LOWER(LTRIM(RTRIM(u.User_Email))) = LOWER(LTRIM(RTRIM(o.Billing_Email)))
    HAVING COUNT(*) = 1
) m
WHERE COALESCE(o.User_Id, m.User_Id) IS NOT NULL
  AND COALESCE(o.User_Id, m.User_Id) NOT IN (SELECT UserId FROM @Excluded)
  AND o.Order_Date > DATEADD(MONTH, -12, GETDATE())
  AND (LOWER(o.Order_Status) IN ('confirmed', 'processing', 'paid', 'completed', 'shipped', 'delivered')
       OR (@IncludePendingCash = 1 AND LOWER(o.Order_Status) = 'pending'
           AND LOWER(o.Payment_Method) IN ('home_delivery', 'cod')))
  AND NOT EXISTS (
      SELECT 1 FROM dbo.LoyaltyPoints lp
      WHERE lp.PointsType = 'earned' AND lp.SourceType = 'order' AND lp.SourceId = o.Order_Id);

DELETE FROM @Candidates WHERE Points <= 0;

SELECT c.OrderId, c.OrderNumber, CONVERT(VARCHAR(10), c.OrderDate, 120) AS OrderDate, c.OrderStatus,
       c.PaymentMethod, c.UserId, u.User_FullName, c.LinkedByEmail, CAST(c.Points AS INT) AS Points,
       CONVERT(VARCHAR(10), DATEADD(MONTH, 12, c.OrderDate), 120) AS ExpiresOn
FROM @Candidates c JOIN dbo.[User] u ON u.User_Id = c.UserId
ORDER BY c.OrderDate;

SELECT COUNT(*) AS Orders, COUNT(DISTINCT UserId) AS Customers, CAST(ISNULL(SUM(Points), 0) AS INT) AS TotalPoints,
       SUM(CAST(LinkedByEmail AS INT)) AS GuestOrdersLinked
FROM @Candidates;

IF @DryRun = 1
BEGIN
    PRINT 'Dry run: nothing changed. Set @DryRun = 0 to apply.';
    RETURN;
END

IF OBJECT_ID('dbo.LoyaltyBackfill_20261111') IS NULL
    CREATE TABLE dbo.LoyaltyBackfill_20261111 (
        OrderId INT NOT NULL, LoyaltyPointId INT NULL, LinkedUserId INT NULL, CreatedAt DATETIME NOT NULL DEFAULT GETDATE());

BEGIN TRANSACTION;

INSERT INTO dbo.LoyaltyBackfill_20261111 (OrderId, LinkedUserId)
SELECT OrderId, UserId FROM @Candidates WHERE LinkedByEmail = 1;

UPDATE o SET User_Id = c.UserId, Updated_At = GETDATE()
FROM dbo.Orders o JOIN @Candidates c ON c.OrderId = o.Order_Id
WHERE c.LinkedByEmail = 1 AND o.User_Id IS NULL;

DECLARE @Inserted TABLE (LoyaltyPointId INT, OrderId INT);

INSERT INTO dbo.LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate, ExpiryDate)
OUTPUT inserted.LoyaltyPointId, inserted.SourceId INTO @Inserted
SELECT c.UserId, c.Points, 'earned', 'order', c.OrderId,
       CONCAT(N'Earned ', CONVERT(NVARCHAR(40), CAST(c.Points AS INT)), N' points from order #', c.OrderNumber),
       c.OrderDate, DATEADD(MONTH, 12, c.OrderDate)
FROM @Candidates c;

INSERT INTO dbo.LoyaltyBackfill_20261111 (OrderId, LoyaltyPointId)
SELECT OrderId, LoyaltyPointId FROM @Inserted;

COMMIT TRANSACTION;

DECLARE @InsertedCount INT = (SELECT COUNT(*) FROM @Inserted);
PRINT CONCAT('Applied: ', @InsertedCount, ' loyalty rows inserted.');

/* Undo:
BEGIN TRANSACTION;
DELETE lp FROM dbo.LoyaltyPoints lp JOIN dbo.LoyaltyBackfill_20261111 b ON b.LoyaltyPointId = lp.LoyaltyPointId;
UPDATE o SET User_Id = NULL FROM dbo.Orders o JOIN dbo.LoyaltyBackfill_20261111 b ON b.OrderId = o.Order_Id AND b.LinkedUserId = o.User_Id;
DROP TABLE dbo.LoyaltyBackfill_20261111;
COMMIT TRANSACTION;
*/
