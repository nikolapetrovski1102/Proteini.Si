SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Packaging_Deactivate
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.Packaging SET IsActive = 0 WHERE Packaging_Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
