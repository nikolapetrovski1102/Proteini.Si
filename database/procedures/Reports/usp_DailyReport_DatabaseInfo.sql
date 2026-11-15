SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Size of the current database files, for the developer's server report.
CREATE OR ALTER PROCEDURE dbo.usp_DailyReport_DatabaseInfo
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        DB_NAME() AS DatabaseName,
        CAST(SUM(CASE WHEN type_desc = 'ROWS' THEN size END) * 8.0 / 1024 AS DECIMAL(12, 1)) AS DataMb,
        CAST(SUM(CASE WHEN type_desc = 'LOG' THEN size END) * 8.0 / 1024 AS DECIMAL(12, 1)) AS LogMb
    FROM sys.database_files;
END
GO
