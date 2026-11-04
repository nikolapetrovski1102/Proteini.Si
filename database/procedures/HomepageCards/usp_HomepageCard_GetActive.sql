SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_GetActive
    @Section NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive
    FROM dbo.HomepageCards
    WHERE IsActive = 1
      AND (@Section IS NULL OR Section = @Section)
    ORDER BY CASE WHEN Section = 'goal' THEN 0 ELSE 1 END, DisplayOrder, Id;
END
GO
