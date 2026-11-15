SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Products bought in placed orders that run out soon: run-out = order date + Servings x Quantity days
-- (one serving a day). Due from @DaysBefore days before the run-out until 10 days after it, unless the
-- customer has bought the same product again since. Products with fewer than @MinServings servings
-- (bars, single drinks) are skipped.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetReplenishments
    @DaysBefore INT,
    @MinServings INT = 14,
    @CapHours INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    -- Who may receive marketing email: consent from the cookie banner / checkout, or an active
    -- newsletter subscription, and never anyone who unsubscribed from an email.
    SELECT Email INTO #Allowed FROM (
        SELECT LOWER(c.Email) AS Email FROM dbo.MarketingContacts c
        WHERE c.Consent = 1 AND c.UnsubscribedAt IS NULL
        UNION
        SELECT LOWER(n.Email) FROM dbo.NewsletterSubscribers n
        WHERE n.IsActive = 1
          AND NOT EXISTS (SELECT 1 FROM dbo.MarketingContacts c WHERE c.Email = n.Email AND c.UnsubscribedAt IS NOT NULL)
    ) a;
    CREATE UNIQUE CLUSTERED INDEX IX_Allowed ON #Allowed (Email);

    -- Frequency cap: at most one marketing email per address in @CapHours.
    SELECT DISTINCT LOWER(l.Email) AS Email INTO #Capped
    FROM dbo.MarketingEmailLog l
    WHERE l.Status = 'sent' AND l.SentAt >= DATEADD(HOUR, -@CapHours, GETDATE());

    -- Admin accounts never get campaigns (they get test sends instead).
    SELECT LOWER(u.User_Email) AS Email INTO #Admins FROM dbo.[User] u WHERE u.SuperAdmin = 1;

    SELECT
        oi.OrderItem_Id AS OrderItemId, o.Order_Id AS OrderId, o.User_Id AS UserId,
        LOWER(o.Billing_Email) AS Email, o.Billing_FullName AS FullName, o.Order_Date AS OrderDate,
        p.Product_Id AS ProductId, COALESCE(p.Name, oi.Product_Name) AS ProductName, oi.Variant_Name AS VariantName,
        COALESCE(v.Variant_Image_Path, v.Image_Path, p.Img) AS ProductImg, COALESCE(v.Price_With_DDV, p.Price) AS Price,
        p.Servings, oi.Quantity,
        DATEADD(DAY, p.Servings * oi.Quantity, o.Order_Date) AS RunOutDate,
        N'replenish:' + CAST(oi.OrderItem_Id AS NVARCHAR(20)) AS ReferenceKey,
        COALESCE(ou.User_Language, o.Language, N'mk') AS Language
    FROM dbo.OrderItems oi
    JOIN dbo.Orders o ON o.Order_Id = oi.Order_Id
    LEFT JOIN dbo.[User] ou ON ou.User_Id = o.User_Id
    JOIN dbo.Products p ON p.Product_Id = oi.Product_Id
    LEFT JOIN dbo.ProductVariants v ON v.Variant_Id = oi.Variant_Id
    JOIN #Allowed a ON a.Email = LOWER(o.Billing_Email)
    WHERE p.Servings >= @MinServings
      AND ISNULL(p.IsGiftVoucher, 0) = 0
      AND (o.Payment_Method <> 'credit_card' OR o.Payment_Status = 'completed')
      AND ISNULL(o.Order_Status, '') NOT IN ('cancelled', 'rejected', 'refunded')
      AND DATEADD(DAY, p.Servings * oi.Quantity - @DaysBefore, o.Order_Date) <= GETDATE()
      AND DATEADD(DAY, p.Servings * oi.Quantity + 10, o.Order_Date) >= GETDATE()
      AND NOT EXISTS (SELECT 1 FROM #Admins ad WHERE ad.Email = a.Email)
      AND NOT EXISTS (SELECT 1 FROM #Capped cp WHERE cp.Email = a.Email)
      AND NOT EXISTS (
            SELECT 1 FROM dbo.Orders o2
            JOIN dbo.OrderItems oi2 ON oi2.Order_Id = o2.Order_Id
            WHERE oi2.Product_Id = oi.Product_Id
              AND o2.Order_Date > o.Order_Date
              AND (LOWER(o2.Billing_Email) = a.Email OR (o.User_Id IS NOT NULL AND o2.User_Id = o.User_Id))
              AND (o2.Payment_Method <> 'credit_card' OR o2.Payment_Status = 'completed'))
      AND NOT EXISTS (
            SELECT 1 FROM dbo.MarketingEmailLog l
            WHERE l.TemplateCode = N'replenishment' AND l.Status = 'sent'
              AND l.ReferenceKey = N'replenish:' + CAST(oi.OrderItem_Id AS NVARCHAR(20)))
    ORDER BY a.Email, RunOutDate;
END
GO
