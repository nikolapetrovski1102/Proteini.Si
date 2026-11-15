SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Templates with how many were sent in the last 30 days.
CREATE OR ALTER PROCEDURE dbo.usp_MarketingTemplate_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT t.Code, t.Name, t.IsActive, t.SendTime, t.DelayValue, t.Subject, t.Preheader, t.Heading, t.Body,
           t.ButtonText, t.ButtonUrl, t.CouponCode, t.CouponText, t.UpdatedAt, t.UpdatedBy,
           t.Subject_Al AS SubjectAl, t.Preheader_Al AS PreheaderAl, t.Heading_Al AS HeadingAl, t.Body_Al AS BodyAl,
           t.ButtonText_Al AS ButtonTextAl, t.CouponText_Al AS CouponTextAl,
           (SELECT COUNT(*) FROM dbo.MarketingEmailLog l
            WHERE l.TemplateCode = t.Code AND l.Status = 'sent' AND l.SentAt >= DATEADD(DAY, -30, GETDATE())) AS SentLast30Days,
           (SELECT COUNT(*) FROM dbo.MarketingEmailLog l WHERE l.TemplateCode = t.Code AND l.Status = 'sent') AS SentTotal,
           (SELECT MAX(l.SentAt) FROM dbo.MarketingEmailLog l WHERE l.TemplateCode = t.Code AND l.Status = 'sent') AS LastSentAt
    FROM dbo.MarketingEmailTemplates t
    ORDER BY CASE t.Code WHEN N'welcome' THEN 1 WHEN N'abandoned_checkout' THEN 2 WHEN N'replenishment' THEN 3 WHEN N'new_discount' THEN 4 ELSE 9 END;
END
GO
