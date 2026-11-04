SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_NewsletterSubscriber_UpdateStatus
    @Id INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.NewsletterSubscribers
    SET IsActive = @IsActive,
        UnsubscribedAt = CASE WHEN @IsActive = 0 THEN SYSUTCDATETIME() ELSE NULL END,
        UpdatedAt = GETDATE()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
