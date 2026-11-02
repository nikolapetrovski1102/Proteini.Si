CREATE OR ALTER PROCEDURE dbo.usp_HomepageCard_Update
    @Id INT,
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

    UPDATE dbo.HomepageCards
    SET Section = @Section,
        TitleMk = @TitleMk,
        TitleAl = @TitleAl,
        Slug = @Slug,
        FilterValue = @FilterValue,
        DestinationUrl = @DestinationUrl,
        ImagePath = @ImagePath,
        DisplayOrder = @DisplayOrder,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE Id = @Id;
END
GO
