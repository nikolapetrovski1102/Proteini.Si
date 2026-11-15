SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Releases a report day again (used when sending failed, or for a forced re-send).
CREATE OR ALTER PROCEDURE dbo.usp_DailyReport_Unmark
    @ReportDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.DailyReportRuns WHERE ReportDate = @ReportDate;
END
GO
