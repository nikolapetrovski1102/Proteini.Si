SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Claims today's run of one template; returns Claimed = 1 only for the first caller.
CREATE OR ALTER PROCEDURE dbo.usp_MarketingRun_Claim
    @TemplateCode NVARCHAR(40),
    @RunDate DATE,
    @Force BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @Force = 1
        DELETE dbo.MarketingRuns WHERE TemplateCode = @TemplateCode AND RunDate = @RunDate;

    BEGIN TRY
        INSERT dbo.MarketingRuns (TemplateCode, RunDate) VALUES (@TemplateCode, @RunDate);
        SELECT 1 AS Claimed;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2601, 2627) SELECT 0 AS Claimed;
        ELSE THROW;
    END CATCH
END
GO
