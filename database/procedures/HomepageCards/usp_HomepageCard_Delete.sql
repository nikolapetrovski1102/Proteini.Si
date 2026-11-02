CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.HomepageCards
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
