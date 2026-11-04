SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetById
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
           User_Id,
           User_FullName,
           User_Email,
           User_IsCompany,
           PasswordHash,
           PasswordSalt,
           ResetToken,
           ResetTokenExpiration,
           SuperAdmin,
           Company_Name,
           Company_Address,
           Company_TaxNumber,
           Company_PostCode,
           Company_City,
           Company_Country,
           Company_Phone,
           Company_CreatedAt,
           User_Phone,
           User_Address,
           User_City,
           User_PostCode,
           User_Country
    FROM dbo.[User]
    WHERE User_Id = @UserId;
END
GO
