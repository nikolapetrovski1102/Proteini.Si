SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_BranchLocation_Update
    @Id INT,
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

    UPDATE dbo.BranchLocations
    SET Type = @Type,
        Name = @Name,
        City = @City,
        Address = @Address,
        Phone = @Phone,
        Email = @Email,
        WorkingHoursMonFri = @WorkingHoursMonFri,
        WorkingHoursSat = @WorkingHoursSat,
        WorkingHoursSun = @WorkingHoursSun,
        Coordinates = @Coordinates,
        DisplayOrder = @DisplayOrder,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
