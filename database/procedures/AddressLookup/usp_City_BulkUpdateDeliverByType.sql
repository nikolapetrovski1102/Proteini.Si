SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_City_BulkUpdateDeliverByType
    @Is_Town BIT,
    @Deliver BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.City
    SET Deliver = @Deliver
    WHERE Is_Town = @Is_Town;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
