SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 created, 1 parent missing, 2 slug empty, 3 slug taken
CREATE OR ALTER PROCEDURE dbo.usp_ProductCategory_Create
    @Name NVARCHAR(4000),
    @Slug NVARCHAR(4000),
    @ParentId INT = NULL,
    @DisplayOrder INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF @ParentId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.ProductCategories WITH (UPDLOCK, HOLDLOCK) WHERE Category_Id = @ParentId)
    BEGIN
        COMMIT TRANSACTION;
        SELECT 1 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF LTRIM(RTRIM(@Slug)) = ''
    BEGIN
        COMMIT TRANSACTION;
        SELECT 2 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.ProductCategories WITH (UPDLOCK, HOLDLOCK) WHERE Category_Slug = @Slug)
    BEGIN
        COMMIT TRANSACTION;
        SELECT 3 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    INSERT INTO dbo.ProductCategories (Category_Name, Category_Slug, Parent_Category_Id, Display_Order)
    VALUES (@Name, @Slug, @ParentId, @DisplayOrder);

    DECLARE @Id INT = CAST(SCOPE_IDENTITY() AS INT);

    COMMIT TRANSACTION;

    SELECT 0 AS Result, @Id AS Id;
END
GO
