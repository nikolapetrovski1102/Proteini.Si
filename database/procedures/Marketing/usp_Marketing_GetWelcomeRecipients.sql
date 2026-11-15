SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- New accounts created between @MaxAgeDays ago and @MinAgeHours ago that have not had the welcome email.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetWelcomeRecipients
    @MinAgeHours INT,
    @MaxAgeDays INT = 3,
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

    SELECT u.User_Id AS UserId, LOWER(u.User_Email) AS Email, u.User_FullName AS FullName,
           N'welcome:' + CAST(u.User_Id AS NVARCHAR(20)) AS ReferenceKey,
           COALESCE(u.User_Language, (SELECT TOP 1 lo.Language FROM dbo.Orders lo
                             WHERE LOWER(lo.Billing_Email) = a.Email AND lo.Language IS NOT NULL
                             ORDER BY lo.Order_Date DESC), N'mk') AS Language
    FROM dbo.[User] u
    JOIN #Allowed a ON a.Email = LOWER(u.User_Email)
    WHERE u.User_CreatedAt >= DATEADD(DAY, -@MaxAgeDays, GETDATE())
      AND u.User_CreatedAt <= DATEADD(HOUR, -@MinAgeHours, GETDATE())
      AND ISNULL(u.SuperAdmin, 0) = 0
      AND NOT EXISTS (SELECT 1 FROM #Capped c WHERE c.Email = a.Email)
      AND NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailLog l
                      WHERE l.TemplateCode = N'welcome' AND l.Status = 'sent'
                        AND l.ReferenceKey = N'welcome:' + CAST(u.User_Id AS NVARCHAR(20)));
END
GO
