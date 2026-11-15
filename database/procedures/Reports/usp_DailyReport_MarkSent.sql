SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Claims a report day. Returns 1 when this call claimed it, 0 when it was already sent.
CREATE OR ALTER PROCEDURE dbo.usp_DailyReport_MarkSent
    @ReportDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.DailyReportRuns WITH (UPDLOCK, HOLDLOCK) WHERE ReportDate = @ReportDate)
    BEGIN
        COMMIT TRANSACTION;
        SELECT 0 AS Claimed;
        RETURN;
    END

    INSERT INTO dbo.DailyReportRuns (ReportDate, SentAt) VALUES (@ReportDate, GETDATE());
    COMMIT TRANSACTION;

    SELECT 1 AS Claimed;
END
GO
