IF OBJECT_ID('dbo.BranchLocations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BranchLocations (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        City NVARCHAR(200) NULL,
        Address NVARCHAR(500) NULL,
        Phone NVARCHAR(100) NULL,
        Email NVARCHAR(200) NULL,
        WorkingHoursMonFri NVARCHAR(100) NULL,
        WorkingHoursSat NVARCHAR(100) NULL,
        WorkingHoursSun NVARCHAR(100) NULL,
        Coordinates NVARCHAR(500) NULL,
        DisplayOrder INT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
    );
END
GO
