SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Country_UpdateAllowPhone
    @Country_Id INT,
    @Allow_Phone BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Country
    SET Allow_Phone = @Allow_Phone
    WHERE Country_Id = @Country_Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
