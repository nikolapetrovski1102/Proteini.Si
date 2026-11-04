SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_ProductVariants_ResolvePackaging
    @PackagingId INT,
    @PackagingName NVARCHAR(MAX),
    @WeightGrams DECIMAL(10, 2),
    @HasWeight BIT,
    @ResolvedId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @ResolvedId = NULL;

    IF @PackagingId > 0
        SET @ResolvedId = @PackagingId;
    ELSE IF @PackagingName IS NOT NULL
    BEGIN
        SELECT TOP 1 @ResolvedId = Packaging_Id
        FROM dbo.Packaging WITH (UPDLOCK, HOLDLOCK)
        WHERE LOWER(Packaging_Name) = LOWER(@PackagingName)
          AND IsActive = 1;

        IF @ResolvedId IS NULL
        BEGIN
            DECLARE @DisplayOrder INT;

            SELECT @DisplayOrder = ISNULL(MAX(Display_Order), -1) + 1
            FROM dbo.Packaging WITH (UPDLOCK, HOLDLOCK);

            INSERT INTO dbo.Packaging (Packaging_Name, Weight_Grams, Display_Order, IsActive, Created_At)
            VALUES (@PackagingName, @WeightGrams, @DisplayOrder, 1, GETDATE());

            SET @ResolvedId = CAST(SCOPE_IDENTITY() AS int);
            RETURN;
        END
    END

    IF @ResolvedId IS NOT NULL AND @HasWeight = 1
        UPDATE dbo.Packaging
        SET Weight_Grams = @WeightGrams
        WHERE Packaging_Id = @ResolvedId;
END
GO
