SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_Register
    @User_FullName NVARCHAR(4000),
    @User_Email NVARCHAR(4000),
    @User_IsCompany BIT,
    @PasswordHash VARBINARY(512),
    @PasswordSalt VARBINARY(512),
    @User_Phone NVARCHAR(4000),
    @Company_Name NVARCHAR(4000),
    @Company_Address NVARCHAR(4000),
    @Company_TaxNumber NVARCHAR(4000),
    @Company_PostCode NVARCHAR(4000),
    @Company_City NVARCHAR(4000),
    @Company_Country NVARCHAR(4000),
    @Company_Phone NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.[User] WITH (UPDLOCK, HOLDLOCK) WHERE User_Email = @User_Email)
    BEGIN
        COMMIT;
        SELECT 1 AS Result, CAST(NULL AS INT) AS UserId;
        RETURN;
    END

    IF @User_IsCompany = 1
        INSERT INTO dbo.[User] (
            User_FullName, User_Email, User_IsCompany, PasswordHash, PasswordSalt, SuperAdmin,
            Company_Name, Company_Address, Company_TaxNumber, Company_PostCode, Company_City,
            Company_Country, Company_Phone, Company_CreatedAt, User_Phone)
        VALUES (
            @User_FullName, @User_Email, 1, @PasswordHash, @PasswordSalt, 0,
            @Company_Name, @Company_Address, @Company_TaxNumber, @Company_PostCode, @Company_City,
            @Company_Country, @Company_Phone, GETDATE(), @User_Phone);
    ELSE
        INSERT INTO dbo.[User] (
            User_FullName, User_Email, User_IsCompany, PasswordHash, PasswordSalt, SuperAdmin, User_Phone)
        VALUES (
            @User_FullName, @User_Email, 0, @PasswordHash, @PasswordSalt, 0, @User_Phone);

    DECLARE @UserId INT = CAST(SCOPE_IDENTITY() AS INT);
    COMMIT;

    SELECT 0 AS Result, @UserId AS UserId;
END
GO
