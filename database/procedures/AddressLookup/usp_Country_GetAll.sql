SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Country_GetAll
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Country_Id         AS CountryId,
        Iso2,
        Name_En            AS NameEn,
        Name_Mk            AS NameMk,
        Dial_Code          AS DialCode,
        CAST(Phone_Min_Digits AS INT) AS PhoneMinDigits,
        CAST(Phone_Max_Digits AS INT) AS PhoneMaxDigits,
        Phone_Pattern      AS PhonePattern,
        Strip_Leading_Zero AS StripLeadingZero,
        Allow_Phone        AS AllowPhone,
        Allow_Shipping     AS AllowShipping,
        Sort_Order         AS SortOrder
    FROM dbo.Country
    ORDER BY Sort_Order, Name_En;
END
GO
