CREATE OR ALTER PROCEDURE dbo.usp_BranchLocation_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.BranchLocations
    ORDER BY Type, DisplayOrder, Id;
END
GO
