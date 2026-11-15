SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Everything the daily business report needs for [@From, @To) in shop-local time (GETDATE()).
-- Result sets: 1 summary, 2 orders, 3 top products, 4 traffic sources, 5 leads.
--
-- An order counts as "placed" when it is cash on delivery, or a card order whose payment went
-- through (completed, or later refunded). Card orders still pending/failed were abandoned at
-- the payment page.
CREATE OR ALTER PROCEDURE dbo.usp_DailyReport_Get
    @From DATETIME2,
    @To DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    ---------------------------------------------------------------------------------------------
    -- Orders in the window
    ---------------------------------------------------------------------------------------------
    SELECT
        o.Order_Id, o.Order_Number, o.Order_Date, o.User_Id,
        o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Billing_City,
        o.Payment_Method, o.Payment_Status, o.Order_Status, o.Total_Amount,
        CAST(CASE WHEN o.Payment_Method <> 'credit_card' OR o.Payment_Status IN ('completed', 'refunded')
                  THEN 1 ELSE 0 END AS BIT) AS IsPlaced
    INTO #Orders
    FROM dbo.Orders o
    WHERE o.Order_Date >= @From AND o.Order_Date < @To;

    -- Emails and users that placed an order from @From until now (a lead who ordered this
    -- morning is no longer a lead).
    SELECT DISTINCT LOWER(LTRIM(RTRIM(o.Billing_Email))) AS Email, o.User_Id
    INTO #Buyers
    FROM dbo.Orders o
    WHERE o.Order_Date >= @From
      AND (o.Payment_Method <> 'credit_card' OR o.Payment_Status IN ('completed', 'refunded'));

    ---------------------------------------------------------------------------------------------
    -- Storefront events in the window, one row per visitor with funnel flags
    ---------------------------------------------------------------------------------------------
    SELECT
        e.VisitorId,
        SUM(CASE WHEN e.EventType = 'page_view' THEN 1 ELSE 0 END) AS PageViews,
        MAX(CASE WHEN e.EventType = 'cart_add' THEN 1 ELSE 0 END) AS HasCart,
        MAX(CASE WHEN e.EventType = 'checkout_start' THEN 1 ELSE 0 END) AS HasCheckout,
        MAX(CASE WHEN e.EventType = 'order_created' THEN 1 ELSE 0 END) AS HasOrder
    INTO #Visitors
    FROM dbo.SiteEvents e
    WHERE e.CreatedAt >= @From AND e.CreatedAt < @To
      AND e.VisitorId IS NOT NULL
    GROUP BY e.VisitorId;

    DECLARE @NewVisitors INT = (
        SELECT COUNT(*)
        FROM #Visitors v
        WHERE NOT EXISTS (
            SELECT 1 FROM dbo.SiteEvents s
            WHERE s.VisitorId = v.VisitorId AND s.CreatedAt < @From));

    -- Registered users whose saved cart was touched in the window and who have not ordered since.
    SELECT c.User_Id, SUM(i.Price * i.Quantity) AS CartValue, SUM(i.Quantity) AS Items, MAX(i.UpdatedAt) AS LastActivity
    INTO #OpenCarts
    FROM dbo.ShoppingCart c
    JOIN dbo.CartItems i ON i.Cart_Id = c.Cart_Id
    JOIN dbo.[User] u ON u.User_Id = c.User_Id AND ISNULL(u.SuperAdmin, 0) = 0
    WHERE NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.User_Id = c.User_Id OR b.Email = LOWER(u.User_Email))
    GROUP BY c.User_Id
    HAVING MAX(i.UpdatedAt) >= @From AND MAX(i.UpdatedAt) < @To;

    ---------------------------------------------------------------------------------------------
    -- 1. Summary
    ---------------------------------------------------------------------------------------------
    SELECT
        (SELECT COUNT(*) FROM #Visitors) AS Visitors,
        @NewVisitors AS NewVisitors,
        (SELECT ISNULL(SUM(PageViews), 0) FROM #Visitors) AS PageViews,
        (SELECT COUNT(*) FROM #Visitors WHERE HasCart = 1) AS CartVisitors,
        (SELECT COUNT(*) FROM #Visitors WHERE HasCheckout = 1) AS CheckoutVisitors,
        (SELECT COUNT(*) FROM #Visitors WHERE HasOrder = 1) AS OrderVisitors,
        (SELECT COUNT(*) FROM #Visitors WHERE HasCart = 1 AND HasCheckout = 0 AND HasOrder = 0) AS CartNoCheckout,
        (SELECT COUNT(*) FROM #Visitors WHERE HasCheckout = 1 AND HasOrder = 0) AS CheckoutNoOrder,
        (SELECT COUNT(*) FROM #OpenCarts) AS RegisteredOpenCarts,
        (SELECT ISNULL(SUM(CartValue), 0) FROM #OpenCarts) AS RegisteredOpenCartsValue,

        (SELECT COUNT(*) FROM dbo.[User] WHERE User_CreatedAt >= @From AND User_CreatedAt < @To) AS NewAccounts,
        (SELECT COUNT(*) FROM dbo.[User] WHERE User_CreatedAt >= @From AND User_CreatedAt < @To AND EmailConfirmed = 1) AS NewAccountsConfirmed,
        (SELECT COUNT(*) FROM dbo.NewsletterSubscribers WHERE SubscribedAt >= @From AND SubscribedAt < @To AND IsActive = 1) AS NewsletterSignups,

        (SELECT COUNT(*) FROM #Orders WHERE IsPlaced = 1) AS OrdersPlaced,
        (SELECT COUNT(*) FROM #Orders WHERE IsPlaced = 1 AND Payment_Method = 'credit_card') AS OrdersPaidOnline,
        (SELECT COUNT(*) FROM #Orders WHERE IsPlaced = 1 AND Payment_Method <> 'credit_card') AS OrdersCashOnDelivery,
        (SELECT COUNT(*) FROM #Orders WHERE IsPlaced = 1 AND User_Id IS NULL) AS GuestOrders,
        (SELECT COUNT(*) FROM #Orders WHERE IsPlaced = 0) AS CardPaymentsNotCompleted,
        (SELECT ISNULL(SUM(Total_Amount), 0) FROM #Orders WHERE IsPlaced = 0) AS CardPaymentsNotCompletedValue,
        (SELECT ISNULL(SUM(Total_Amount), 0) FROM #Orders
            WHERE IsPlaced = 1 AND Order_Status NOT IN ('cancelled', 'rejected')) AS Revenue,
        (SELECT COUNT(DISTINCT LOWER(Billing_Email)) FROM #Orders WHERE IsPlaced = 1) AS Customers,
        (SELECT COUNT(DISTINCT LOWER(o.Billing_Email)) FROM #Orders o
            WHERE o.IsPlaced = 1
              AND EXISTS (SELECT 1 FROM dbo.Orders p
                          WHERE p.Billing_Email = o.Billing_Email AND p.Order_Date < @From
                            AND (p.Payment_Method <> 'credit_card' OR p.Payment_Status IN ('completed', 'refunded')))) AS ReturningCustomers;

    ---------------------------------------------------------------------------------------------
    -- 2. Orders
    ---------------------------------------------------------------------------------------------
    SELECT Order_Id, Order_Number, Order_Date, Billing_FullName, Billing_City,
           Payment_Method, Payment_Status, Order_Status, Total_Amount, IsPlaced
    FROM #Orders
    ORDER BY Order_Date;

    ---------------------------------------------------------------------------------------------
    -- 3. Best sellers among placed, not cancelled orders
    ---------------------------------------------------------------------------------------------
    SELECT TOP (8)
        i.Product_Name + CASE WHEN NULLIF(i.Variant_Name, '') IS NULL THEN '' ELSE ' - ' + i.Variant_Name END AS ProductName,
        SUM(i.Quantity) AS Quantity,
        SUM(i.Subtotal) AS Revenue
    FROM #Orders o
    JOIN dbo.OrderItems i ON i.Order_Id = o.Order_Id
    WHERE o.IsPlaced = 1 AND o.Order_Status NOT IN ('cancelled', 'rejected')
    GROUP BY i.Product_Name + CASE WHEN NULLIF(i.Variant_Name, '') IS NULL THEN '' ELSE ' - ' + i.Variant_Name END
    ORDER BY SUM(i.Quantity) DESC, SUM(i.Subtotal) DESC;

    ---------------------------------------------------------------------------------------------
    -- 4. Where new visits came from (referrer of each visitor's first page view in the window)
    ---------------------------------------------------------------------------------------------
    ;WITH FirstView AS (
        SELECT e.VisitorId, e.Referrer,
               ROW_NUMBER() OVER (PARTITION BY e.VisitorId ORDER BY e.CreatedAt) AS rn
        FROM dbo.SiteEvents e
        WHERE e.CreatedAt >= @From AND e.CreatedAt < @To
          AND e.VisitorId IS NOT NULL AND e.EventType = 'page_view'
    )
    SELECT TOP (6) ISNULL(NULLIF(Referrer, ''), 'Direct') AS Source, COUNT(*) AS Visitors
    FROM FirstView
    WHERE rn = 1
    GROUP BY ISNULL(NULLIF(Referrer, ''), 'Direct')
    ORDER BY COUNT(*) DESC;

    ---------------------------------------------------------------------------------------------
    -- 5. Possible leads: people who showed buying intent but did not order. One row per email,
    --    keeping the strongest signal (lowest priority number).
    ---------------------------------------------------------------------------------------------
    CREATE TABLE #Leads (
        Priority INT NOT NULL,
        Reason NVARCHAR(100) NOT NULL,
        FullName NVARCHAR(400) NULL,
        Email NVARCHAR(400) NULL,
        Phone NVARCHAR(100) NULL,
        Value DECIMAL(18, 2) NULL,
        LastActivity DATETIME2 NULL
    );

    INSERT INTO #Leads
    SELECT 1, N'Card payment not completed', o.Billing_FullName, o.Billing_Email, o.Billing_Phone, o.Total_Amount, o.Order_Date
    FROM #Orders o
    WHERE o.IsPlaced = 0
      AND NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.Email = LOWER(LTRIM(RTRIM(o.Billing_Email))));

    INSERT INTO #Leads
    SELECT 2, N'Started checkout as guest, no order', MAX(e.FullName), e.Email, NULL, NULL, MAX(e.CreatedAt)
    FROM dbo.SiteEvents e
    WHERE e.CreatedAt >= @From AND e.CreatedAt < @To
      AND e.EventType = 'checkout_email' AND e.Email IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.Email = LOWER(e.Email))
    GROUP BY e.Email;

    INSERT INTO #Leads
    SELECT 3, N'Started checkout, no order', u.User_FullName, u.User_Email, u.User_Phone, oc.CartValue, MAX(e.CreatedAt)
    FROM dbo.SiteEvents e
    JOIN dbo.[User] u ON u.User_Id = e.UserId AND ISNULL(u.SuperAdmin, 0) = 0
    LEFT JOIN #OpenCarts oc ON oc.User_Id = u.User_Id
    WHERE e.CreatedAt >= @From AND e.CreatedAt < @To
      AND e.EventType = 'checkout_start'
      AND NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.User_Id = u.User_Id OR b.Email = LOWER(u.User_Email))
    GROUP BY u.User_Id, u.User_FullName, u.User_Email, u.User_Phone, oc.CartValue;

    INSERT INTO #Leads
    SELECT 4, N'Items in cart, no order', u.User_FullName, u.User_Email, u.User_Phone, oc.CartValue, oc.LastActivity
    FROM #OpenCarts oc
    JOIN dbo.[User] u ON u.User_Id = oc.User_Id;

    INSERT INTO #Leads
    SELECT 5, N'New account, no order yet', u.User_FullName, u.User_Email, u.User_Phone, NULL, u.User_CreatedAt
    FROM dbo.[User] u
    WHERE u.User_CreatedAt >= @From AND u.User_CreatedAt < @To
      AND ISNULL(u.SuperAdmin, 0) = 0
      AND NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.User_Id = u.User_Id OR b.Email = LOWER(u.User_Email));

    INSERT INTO #Leads
    SELECT 6, N'Newsletter signup', NULL, n.Email, NULL, NULL, n.SubscribedAt
    FROM dbo.NewsletterSubscribers n
    WHERE n.SubscribedAt >= @From AND n.SubscribedAt < @To AND n.IsActive = 1
      AND NOT EXISTS (SELECT 1 FROM #Buyers b WHERE b.Email = LOWER(n.Email));

    ;WITH Ranked AS (
        SELECT *, ROW_NUMBER() OVER (
            PARTITION BY ISNULL(LOWER(LTRIM(RTRIM(Email))), CONCAT('#', Priority, FullName, Phone))
            ORDER BY Priority, LastActivity DESC) AS rn
        FROM #Leads
    )
    SELECT TOP (60) Priority, Reason, FullName, Email, Phone, Value, LastActivity
    FROM Ranked
    WHERE rn = 1
    ORDER BY Priority, Value DESC, LastActivity DESC;
END
GO
