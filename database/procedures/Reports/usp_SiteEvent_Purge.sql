SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Deletes events older than @Before in small batches. Returns the number of rows removed.
CREATE OR ALTER PROCEDURE dbo.usp_SiteEvent_Purge
    @Before DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Total INT = 0, @Batch INT = 1;
    WHILE @Batch > 0
    BEGIN
        DELETE TOP (5000) FROM dbo.SiteEvents WHERE CreatedAt < @Before;
        SET @Batch = @@ROWCOUNT;
        SET @Total += @Batch;
    END

    SELECT @Total AS Deleted;
END
GO
