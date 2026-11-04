SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_GetById
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt
    FROM dbo.HomeSliders
    WHERE Id = @Id;
END
GO
