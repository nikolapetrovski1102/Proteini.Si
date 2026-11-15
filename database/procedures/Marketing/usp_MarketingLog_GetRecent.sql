SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Recent sends for the admin page, plus how many people can currently be emailed.
CREATE OR ALTER PROCEDURE dbo.usp_MarketingLog_GetRecent
    @Top INT = 50
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (@Top) l.Id, l.TemplateCode, l.Email, l.Status, l.Error, l.SentAt
    FROM dbo.MarketingEmailLog l
    ORDER BY l.Id DESC;

    SELECT
        (SELECT COUNT(*) FROM (
            SELECT LOWER(c.Email) AS Email FROM dbo.MarketingContacts c WHERE c.Consent = 1 AND c.UnsubscribedAt IS NULL
            UNION
            SELECT LOWER(n.Email) FROM dbo.NewsletterSubscribers n
            WHERE n.IsActive = 1
              AND NOT EXISTS (SELECT 1 FROM dbo.MarketingContacts c WHERE c.Email = n.Email AND c.UnsubscribedAt IS NOT NULL)
        ) a) AS ConsentedContacts,
        (SELECT COUNT(*) FROM dbo.MarketingContacts WHERE UnsubscribedAt IS NOT NULL) AS Unsubscribed;
END
GO
