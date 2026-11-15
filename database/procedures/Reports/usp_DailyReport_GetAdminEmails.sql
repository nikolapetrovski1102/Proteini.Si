SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Admin accounts that receive the daily business report.
CREATE OR ALTER PROCEDURE dbo.usp_DailyReport_GetAdminEmails
AS
BEGIN
    SET NOCOUNT ON;

    SELECT DISTINCT LTRIM(RTRIM(User_Email)) AS Email
    FROM dbo.[User]
    WHERE SuperAdmin = 1 AND NULLIF(LTRIM(RTRIM(User_Email)), '') IS NOT NULL;
END
GO
