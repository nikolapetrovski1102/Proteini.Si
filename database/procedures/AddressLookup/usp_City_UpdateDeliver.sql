SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_City_UpdateDeliver
    @City_Id INT,
    @Deliver BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.City
    SET Deliver = @Deliver
    WHERE City_Id = @City_Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
