SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DELETE FROM dbo.HomeSliders WHERE Id = @Id;

    DECLARE @RowsAffected INT = @@ROWCOUNT;

    IF @RowsAffected > 0
    BEGIN
        WITH Ordered AS (
            SELECT Id, ROW_NUMBER() OVER (ORDER BY DisplayOrder ASC, Id ASC) - 1 AS NewOrder
            FROM dbo.HomeSliders
        )
        UPDATE hs
        SET DisplayOrder = Ordered.NewOrder
        FROM dbo.HomeSliders hs
        INNER JOIN Ordered ON hs.Id = Ordered.Id;
    END

    COMMIT TRANSACTION;

    SELECT @RowsAffected AS RowsAffected;
END
GO
