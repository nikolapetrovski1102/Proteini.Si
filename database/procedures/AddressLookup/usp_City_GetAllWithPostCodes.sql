SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_City_GetAllWithPostCodes
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.City_Id     AS CityId,
        c.Country_Id  AS CountryId,
        c.Name_Latin  AS NameLatin,
        c.Name_Mk     AS NameMk,
        c.Is_Town     AS IsTown,
        c.Deliver,
        c.Sort_Order  AS SortOrder,
        p.Post_Code   AS PostCode,
        p.Post_Office AS PostOffice
    FROM dbo.City c
    LEFT JOIN dbo.City_PostCode p ON p.City_Id = c.City_Id
    ORDER BY c.Sort_Order, c.Name_Latin, p.Post_Code;
END
GO
