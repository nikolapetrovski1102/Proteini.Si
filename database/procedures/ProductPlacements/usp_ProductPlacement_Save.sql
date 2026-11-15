SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Replaces the pinned products of one listing (Id = product, DisplayOrder = position). Scope 'all' uses Target_Id 0.
-- Unknown product ids are skipped. Result: 0 saved, 1 scope/target not found.
CREATE OR ALTER PROCEDURE dbo.usp_ProductPlacement_Save
    @Scope NVARCHAR(10),
    @TargetId INT,
    @Products dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT (
        (@Scope = N'all' AND @TargetId = 0)
        OR (@Scope = N'category' AND EXISTS (SELECT 1 FROM dbo.ProductCategories WHERE Category_Id = @TargetId))
        OR (@Scope = N'brand' AND EXISTS (SELECT 1 FROM dbo.Brands WHERE Brand_Id = @TargetId)))
    BEGIN
        SELECT 1 AS Result;
        RETURN;
    END

    BEGIN TRANSACTION;

    DELETE FROM dbo.ProductPlacements WITH (HOLDLOCK)
    WHERE Scope = @Scope AND Target_Id = @TargetId;

    INSERT INTO dbo.ProductPlacements (Scope, Target_Id, Product_Id, Position)
    SELECT @Scope, @TargetId, p.Id, ROW_NUMBER() OVER (ORDER BY MIN(p.DisplayOrder), p.Id)
    FROM @Products p
    INNER JOIN dbo.Products pr ON pr.Product_Id = p.Id
    GROUP BY p.Id;

    COMMIT TRANSACTION;

    SELECT 0 AS Result;
END
GO
