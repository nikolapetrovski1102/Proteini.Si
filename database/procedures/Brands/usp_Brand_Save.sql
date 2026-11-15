SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Creates (@Id NULL) or updates a brand. At most four brands can be featured in the header.
-- Result: 0 saved, 1 slug empty, 2 slug taken, 3 already four featured brands, 4 not found
CREATE OR ALTER PROCEDURE dbo.usp_Brand_Save
    @Id INT = NULL,
    @Name NVARCHAR(100),
    @Slug NVARCHAR(100),
    @LogoUrl NVARCHAR(500) = NULL,
    @HeaderImageUrl NVARCHAR(500) = NULL,
    @IsFeatured BIT = 0,
    @DisplayOrder INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF @Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Brands WITH (UPDLOCK, HOLDLOCK) WHERE Brand_Id = @Id)
    BEGIN
        COMMIT TRANSACTION;
        SELECT 4 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF LTRIM(RTRIM(ISNULL(@Slug, ''))) = ''
    BEGIN
        COMMIT TRANSACTION;
        SELECT 1 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.Brands WITH (UPDLOCK, HOLDLOCK) WHERE Brand_Slug = @Slug AND (@Id IS NULL OR Brand_Id <> @Id))
    BEGIN
        COMMIT TRANSACTION;
        SELECT 2 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF @IsFeatured = 1
       AND (SELECT COUNT(*) FROM dbo.Brands WITH (UPDLOCK, HOLDLOCK)
            WHERE Is_Featured = 1 AND (@Id IS NULL OR Brand_Id <> @Id)) >= 4
    BEGIN
        COMMIT TRANSACTION;
        SELECT 3 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF @Id IS NULL
    BEGIN
        INSERT INTO dbo.Brands (Brand_Name, Brand_Slug, Logo_Url, Header_Image_Url, Is_Featured, Display_Order)
        VALUES (@Name, @Slug, @LogoUrl, @HeaderImageUrl, @IsFeatured, @DisplayOrder);

        SET @Id = CAST(SCOPE_IDENTITY() AS INT);
    END
    ELSE
    BEGIN
        UPDATE dbo.Brands
        SET Brand_Name = @Name,
            Brand_Slug = @Slug,
            Logo_Url = @LogoUrl,
            Header_Image_Url = @HeaderImageUrl,
            Is_Featured = @IsFeatured,
            Display_Order = @DisplayOrder
        WHERE Brand_Id = @Id;
    END

    COMMIT TRANSACTION;

    SELECT 0 AS Result, @Id AS Id;
END
GO
