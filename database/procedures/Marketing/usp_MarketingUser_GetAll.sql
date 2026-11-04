SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_MarketingUser_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT User_Id, User_FullName, User_Email, User_Phone, User_IsCompany,
           Company_Name, Company_City, Company_Country, SuperAdmin
    FROM dbo.[User]
    ORDER BY User_Id DESC;
END
GO
