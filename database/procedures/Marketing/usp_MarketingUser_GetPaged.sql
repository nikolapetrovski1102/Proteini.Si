SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_MarketingUser_GetPaged
    @Search NVARCHAR(4000),
    @Offset INT,
    @PageSize INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1)
    FROM dbo.[User] u
    WHERE @Search IS NULL OR u.User_FullName LIKE @Search OR u.User_Email LIKE @Search OR u.User_Phone LIKE @Search;

    SELECT User_Id, User_FullName, User_Email, User_Phone, User_IsCompany,
           Company_Name, Company_City, Company_Country, SuperAdmin,
           (SELECT COUNT(1) FROM dbo.Orders o WHERE o.User_Id = u.User_Id) AS OrderCount,
           (SELECT COALESCE(SUM(o.Total_Amount), 0) FROM dbo.Orders o WHERE o.User_Id = u.User_Id) AS LifetimeOrderValue,
           (SELECT MAX(o.Order_Date) FROM dbo.Orders o WHERE o.User_Id = u.User_Id) AS LastOrderAt
    FROM dbo.[User] u
    WHERE @Search IS NULL OR u.User_FullName LIKE @Search OR u.User_Email LIKE @Search OR u.User_Phone LIKE @Search
    ORDER BY User_Id DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
END
GO
