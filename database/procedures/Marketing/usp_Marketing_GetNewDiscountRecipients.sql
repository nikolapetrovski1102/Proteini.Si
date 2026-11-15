SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- "New discount" email: one row per (new discount, person with marketing consent) not yet emailed about it.
-- A discount is new while it is running, shows on at least one product (a bigger discount can win every
-- product) and started (the later of Starts_On and the day it was created) at most @MaxAgeDays ago.
-- People who hit the frequency cap today get it on a later day, while the discount is still new.
CREATE OR ALTER PROCEDURE dbo.usp_Marketing_GetNewDiscountRecipients
    @MaxAgeDays INT = 3,
    @CapHours INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = CAST(GETDATE() AS DATE);

    SELECT d.Discount_Id
    INTO #New
    FROM dbo.Discounts d
    CROSS APPLY (SELECT CASE WHEN d.Starts_On > CAST(d.Created_At AS DATE) THEN d.Starts_On
                             ELSE CAST(d.Created_At AS DATE) END AS LiveSince) s
    WHERE d.Is_Active = 1
      AND (d.Starts_On IS NULL OR d.Starts_On <= @Today)
      AND (d.Ends_On IS NULL OR d.Ends_On >= @Today)
      AND s.LiveSince >= DATEADD(DAY, -@MaxAgeDays, @Today)
      AND (EXISTS (SELECT 1 FROM dbo.DiscountAppliedProducts a WHERE a.Discount_Id = d.Discount_Id)
           OR EXISTS (SELECT 1 FROM dbo.DiscountAppliedVariants v WHERE v.Discount_Id = d.Discount_Id));

    IF NOT EXISTS (SELECT 1 FROM #New) RETURN;

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
    SELECT DISTINCT LOWER(u.User_Email) AS Email INTO #Admins FROM dbo.[User] u WHERE u.SuperAdmin = 1;

    SELECT n.Discount_Id AS DiscountId, u.User_Id AS UserId, a.Email,
           COALESCE(NULLIF(u.User_FullName, N''),
                    (SELECT TOP 1 lo.Billing_FullName FROM dbo.Orders lo
                     WHERE LOWER(lo.Billing_Email) = a.Email ORDER BY lo.Order_Date DESC)) AS FullName,
           N'discount:' + CAST(n.Discount_Id AS NVARCHAR(20)) + N':' + a.Email AS ReferenceKey,
           COALESCE(u.User_Language, (SELECT TOP 1 lo.Language FROM dbo.Orders lo
                             WHERE LOWER(lo.Billing_Email) = a.Email AND lo.Language IS NOT NULL
                             ORDER BY lo.Order_Date DESC), N'mk') AS Language
    FROM #Allowed a
    CROSS JOIN #New n
    OUTER APPLY (SELECT TOP 1 x.User_Id, x.User_FullName, x.User_Language FROM dbo.[User] x
                 WHERE LOWER(x.User_Email) = a.Email ORDER BY x.User_Id) u
    WHERE NOT EXISTS (SELECT 1 FROM #Admins ad WHERE ad.Email = a.Email)
      AND NOT EXISTS (SELECT 1 FROM #Capped cp WHERE cp.Email = a.Email)
      AND NOT EXISTS (SELECT 1 FROM dbo.MarketingEmailLog l
                      WHERE l.TemplateCode = N'new_discount' AND l.Status = 'sent'
                        AND l.ReferenceKey = N'discount:' + CAST(n.Discount_Id AS NVARCHAR(20)) + N':' + a.Email)
    ORDER BY a.Email, n.Discount_Id;
END
GO
