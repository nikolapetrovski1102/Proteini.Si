SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_Create
    @Section NVARCHAR(20),
    @TitleMk NVARCHAR(200),
    @TitleAl NVARCHAR(200) = NULL,
    @Slug NVARCHAR(160),
    @FilterValue NVARCHAR(200),
    @DestinationUrl NVARCHAR(500) = NULL,
    @ImagePath NVARCHAR(500) = NULL,
    @DisplayOrder INT = 0,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.HomepageCards (
        Section, TitleMk, TitleAl, Slug, FilterValue, DestinationUrl, ImagePath, DisplayOrder, IsActive, CreatedAt
    )
    VALUES (
        @Section, @TitleMk, @TitleAl, @Slug, @FilterValue, @DestinationUrl, @ImagePath, @DisplayOrder, @IsActive, GETDATE()
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
