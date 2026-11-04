SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LandingPageSection_Create
    @SectionType NVARCHAR(4000),
    @Title NVARCHAR(4000) = NULL,
    @ImagePath NVARCHAR(4000) = NULL,
    @Content NVARCHAR(MAX) = NULL,
    @DisplayOrder INT = 0,
    @CreatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @DisplayOrder <= 0
        SELECT @DisplayOrder = ISNULL(MAX(DisplayOrder), -1) + 1 FROM dbo.LandingPageSections;

    INSERT INTO dbo.LandingPageSections (SectionType, Title, ImagePath, Content, DisplayOrder, CreatedBy)
    VALUES (@SectionType, @Title, @ImagePath, @Content, @DisplayOrder, @CreatedBy);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
