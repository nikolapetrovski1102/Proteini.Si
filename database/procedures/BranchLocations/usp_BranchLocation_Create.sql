CREATE OR ALTER PROCEDURE dbo.usp_BranchLocation_Create
    @Type NVARCHAR(20),
    @Name NVARCHAR(200),
    @City NVARCHAR(200) = NULL,
    @Address NVARCHAR(500) = NULL,
    @Phone NVARCHAR(100) = NULL,
    @Email NVARCHAR(200) = NULL,
    @WorkingHoursMonFri NVARCHAR(100) = NULL,
    @WorkingHoursSat NVARCHAR(100) = NULL,
    @WorkingHoursSun NVARCHAR(100) = NULL,
    @Coordinates NVARCHAR(500) = NULL,
    @DisplayOrder INT = 0,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.BranchLocations (
        Type, Name, City, Address, Phone, Email, WorkingHoursMonFri,
        WorkingHoursSat, WorkingHoursSun, Coordinates, DisplayOrder, IsActive, CreatedAt
    )
    VALUES (
        @Type, @Name, @City, @Address, @Phone, @Email, @WorkingHoursMonFri,
        @WorkingHoursSat, @WorkingHoursSun, @Coordinates, @DisplayOrder, @IsActive, GETDATE()
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
