SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 updated, 1 parent missing, 2 slug empty, 3 slug taken, 4 not found, 5 parent would create a cycle
CREATE OR ALTER PROCEDURE dbo.usp_ProductCategory_Update
    @Id INT,
    @Name NVARCHAR(4000),
    @Slug NVARCHAR(4000),
    @ParentId INT = NULL,
    @DisplayOrder INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @Result INT = 0;

    BEGIN TRANSACTION;

    IF @ParentId IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.ProductCategories WITH (UPDLOCK, HOLDLOCK) WHERE Category_Id = @ParentId)
        SET @Result = 1;

    IF @Result = 0 AND @ParentId IS NOT NULL
    BEGIN
        WITH Descendants AS (
            SELECT Category_Id
            FROM dbo.ProductCategories
            WHERE Parent_Category_Id = @Id
            UNION ALL
            SELECT child.Category_Id
            FROM dbo.ProductCategories child
            INNER JOIN Descendants parent ON child.Parent_Category_Id = parent.Category_Id
        )
        SELECT @Result = 5
        FROM Descendants
        WHERE Category_Id = @ParentId
        OPTION (MAXRECURSION 100);
    END

    IF @Result = 0 AND LTRIM(RTRIM(@Slug)) = ''
        SET @Result = 2;

    IF @Result = 0
       AND EXISTS (SELECT 1 FROM dbo.ProductCategories WITH (UPDLOCK, HOLDLOCK) WHERE Category_Slug = @Slug AND Category_Id <> @Id)
        SET @Result = 3;

    DECLARE @OldSlug NVARCHAR(100);

    IF @Result = 0
    BEGIN
        SELECT @OldSlug = Category_Slug
        FROM dbo.ProductCategories WITH (UPDLOCK, HOLDLOCK)
        WHERE Category_Id = @Id;

        IF @@ROWCOUNT = 0
            SET @Result = 4;
    END

    IF @Result = 0
    BEGIN
        IF UPPER(@OldSlug) COLLATE Latin1_General_BIN2 <> UPPER(@Slug) COLLATE Latin1_General_BIN2
           AND NOT EXISTS (SELECT 1 FROM dbo.CategorySlugHistory WHERE OldSlug = @OldSlug)
            INSERT INTO dbo.CategorySlugHistory (CategoryId, OldSlug, CreatedAt)
            VALUES (@Id, @OldSlug, SYSUTCDATETIME());

        UPDATE dbo.ProductCategories
        SET Category_Name = @Name,
            Category_Slug = @Slug,
            Parent_Category_Id = @ParentId,
            Display_Order = @DisplayOrder
        WHERE Category_Id = @Id;

        IF @@ROWCOUNT <> 1
            SET @Result = 4;
    END

    COMMIT TRANSACTION;

    SELECT @Result AS Result;
END
GO
