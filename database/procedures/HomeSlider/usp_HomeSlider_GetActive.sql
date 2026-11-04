SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt
    FROM dbo.HomeSliders
    WHERE IsActive = 1
    ORDER BY DisplayOrder ASC, Id ASC;
END
GO
