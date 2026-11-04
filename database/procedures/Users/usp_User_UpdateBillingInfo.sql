SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_UpdateBillingInfo
    @UserId INT,
    @User_Address NVARCHAR(4000),
    @User_PostCode NVARCHAR(4000),
    @User_City NVARCHAR(4000),
    @User_Country NVARCHAR(4000),
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

    DECLARE @IsCompany BIT;
    DECLARE @Found BIT = 0;

    SELECT @IsCompany = User_IsCompany, @Found = 1
    FROM dbo.[User]
    WHERE User_Id = @UserId;

    IF @Found = 0
    BEGIN
        SELECT -1 AS RowsAffected;
        RETURN;
    END

    IF @IsCompany = 1
        UPDATE dbo.[User] SET
            Company_Name = ISNULL(@Company_Name, Company_Name),
            Company_Address = ISNULL(@Company_Address, Company_Address),
            Company_TaxNumber = ISNULL(@Company_TaxNumber, Company_TaxNumber),
            Company_PostCode = ISNULL(@Company_PostCode, Company_PostCode),
            Company_City = ISNULL(@Company_City, Company_City),
            Company_Country = ISNULL(@Company_Country, Company_Country),
            Company_Phone = ISNULL(@Company_Phone, Company_Phone)
        WHERE User_Id = @UserId;
    ELSE
        UPDATE dbo.[User] SET
            User_Address = ISNULL(@User_Address, User_Address),
            User_PostCode = ISNULL(@User_PostCode, User_PostCode),
            User_City = ISNULL(@User_City, User_City),
            User_Country = ISNULL(@User_Country, User_Country),
            User_Phone = ISNULL(@User_Phone, User_Phone)
        WHERE User_Id = @UserId;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
