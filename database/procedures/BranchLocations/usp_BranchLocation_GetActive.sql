CREATE OR ALTER PROCEDURE dbo.usp_BranchLocation_GetActive
    @Type NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.BranchLocations
    WHERE IsActive = 1
      AND (@Type IS NULL OR Type = @Type)
    ORDER BY Type, DisplayOrder, Id;
END
GO
