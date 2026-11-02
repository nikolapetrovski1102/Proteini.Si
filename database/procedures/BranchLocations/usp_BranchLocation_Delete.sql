CREATE OR ALTER PROCEDURE dbo.usp_BranchLocation_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.BranchLocations
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
