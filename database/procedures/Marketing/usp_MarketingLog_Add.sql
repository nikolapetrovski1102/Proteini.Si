SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Logs one send. Returns Logged = 0 when the same template/reference was already sent
-- (a parallel run got there first).
CREATE OR ALTER PROCEDURE dbo.usp_MarketingLog_Add
    @TemplateCode NVARCHAR(40),
    @Email NVARCHAR(320),
    @UserId INT = NULL,
    @ReferenceKey NVARCHAR(120),
    @Status NVARCHAR(20),
    @Error NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        INSERT dbo.MarketingEmailLog (TemplateCode, Email, UserId, ReferenceKey, Status, Error)
        VALUES (@TemplateCode, LOWER(@Email), @UserId, @ReferenceKey, @Status, LEFT(@Error, 500));
        SELECT 1 AS Logged;
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2601, 2627) SELECT 0 AS Logged;
        ELSE THROW;
    END CATCH
END
GO
