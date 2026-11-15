SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 deleted, 1 still used by products, 2 not found
CREATE OR ALTER PROCEDURE dbo.usp_Brand_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.Products WITH (UPDLOCK, HOLDLOCK) WHERE Brand_Id = @Id)
    BEGIN
        COMMIT TRANSACTION;
        SELECT 1 AS Result;
        RETURN;
    END

    DELETE FROM dbo.Brands WHERE Brand_Id = @Id;

    DECLARE @RowsAffected INT = @@ROWCOUNT;

    COMMIT TRANSACTION;

    SELECT CASE WHEN @RowsAffected > 0 THEN 0 ELSE 2 END AS Result;
END
GO
