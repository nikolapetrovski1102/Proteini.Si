SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- People who reached checkout (logged in, guest who entered an email, or a card payment that never
-- completed) between @MaxAgeHours and @MinAgeHours ago, and have not placed an order since.
-- One reminder per address per 7 days.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetAbandonedCheckouts
    @MinAgeHours INT,
    @MaxAgeHours INT = 48,
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

    DECLARE @From DATETIME2 = DATEADD(HOUR, -@MaxAgeHours, GETDATE());
    DECLARE @Until DATETIME2 = DATEADD(HOUR, -@MinAgeHours, GETDATE());

    SELECT x.Email, MAX(x.UserId) AS UserId, MAX(x.FullName) AS FullName, MAX(x.At) AS LastActivity
    INTO #Checkouts
    FROM (
        SELECT LOWER(u.User_Email) AS Email, u.User_Id AS UserId, u.User_FullName AS FullName, e.CreatedAt AS At
        FROM dbo.SiteEvents e
        JOIN dbo.[User] u ON u.User_Id = e.UserId
        WHERE e.EventType = 'checkout_start' AND e.CreatedAt >= @From
        UNION ALL
        SELECT LOWER(e.Email), NULL, e.FullName, e.CreatedAt
        FROM dbo.SiteEvents e
        WHERE e.EventType = 'checkout_email' AND e.Email IS NOT NULL AND e.CreatedAt >= @From
        UNION ALL
        SELECT LOWER(o.Billing_Email), o.User_Id, o.Billing_FullName, o.Order_Date
        FROM dbo.Orders o
        WHERE o.Payment_Method = 'credit_card' AND o.Payment_Status IN ('pending', 'failed')
          AND o.Order_Date >= @From AND o.Billing_Email IS NOT NULL
    ) x
    GROUP BY x.Email;

    SELECT c.UserId, c.Email, c.FullName, c.LastActivity,
           N'abandoned:' + c.Email + N':' + CONVERT(NCHAR(10), CAST(GETDATE() AS DATE), 23) AS ReferenceKey,
           COALESCE(cu.User_Language, (SELECT TOP 1 lo.Language FROM dbo.Orders lo
                             WHERE LOWER(lo.Billing_Email) = c.Email AND lo.Language IS NOT NULL
                             ORDER BY lo.Order_Date DESC), N'mk') AS Language
    FROM #Checkouts c
    JOIN #Allowed a ON a.Email = c.Email
    LEFT JOIN dbo.[User] cu ON cu.User_Id = c.UserId
    WHERE c.LastActivity <= @Until
      AND NOT EXISTS (SELECT 1 FROM #Admins ad WHERE ad.Email = c.Email)
      AND NOT EXISTS (SELECT 1 FROM #Capped cp WHERE cp.Email = c.Email)
      -- ordered since (cash on delivery, or a card payment that went through)
      AND NOT EXISTS (
            SELECT 1 FROM dbo.Orders o
            WHERE (LOWER(o.Billing_Email) = c.Email OR (c.UserId IS NOT NULL AND o.User_Id = c.UserId))
              AND o.Order_Date >= @From
              AND (o.Payment_Method <> 'credit_card' OR o.Payment_Status IN ('completed', 'refunded')))
      AND NOT EXISTS (
            SELECT 1 FROM dbo.MarketingEmailLog l
            WHERE l.TemplateCode = N'abandoned_checkout' AND l.Status = 'sent'
              AND l.Email = c.Email AND l.SentAt >= DATEADD(DAY, -7, GETDATE()));
END
GO
