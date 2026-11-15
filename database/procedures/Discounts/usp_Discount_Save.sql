SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Creates (@Id NULL) or updates a discount and what it covers. Unknown ids are ignored.
--   * Brands / categories: @TargetIds.
--   * Products: @Items, JSON [{ "productId": 1, "variantId": 5, "newPrice": 999 }]; variantId 0 = a product
--     without variants; newPrice only for @DiscountType 'price' (then @Percentage is NULL).
-- Does not touch prices: the API runs usp_Discount_Sync right after.
-- Result: 0 saved, 4 not found
CREATE OR ALTER PROCEDURE dbo.usp_Discount_Save
    @Id INT = NULL,
    @Name NVARCHAR(150),
    @DiscountType NVARCHAR(10) = N'percent',
    @Percentage DECIMAL(5, 2) = NULL,
    @AppliesTo NVARCHAR(20),
    @StartsOn DATE = NULL,
    @EndsOn DATE = NULL,
    @IsActive BIT = 1,
    @TargetIds dbo.IntList READONLY,
    @Items NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF @Id IS NULL
    BEGIN
        INSERT INTO dbo.Discounts (Name, Discount_Type, Percentage, Applies_To, Starts_On, Ends_On, Is_Active)
        VALUES (@Name, @DiscountType, @Percentage, @AppliesTo, @StartsOn, @EndsOn, @IsActive);
        SET @Id = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE dbo.Discounts
        SET Name = @Name,
            Discount_Type = @DiscountType,
            Percentage = @Percentage,
            Applies_To = @AppliesTo,
            Starts_On = @StartsOn,
            Ends_On = @EndsOn,
            Is_Active = @IsActive,
            Updated_At = GETDATE()
        WHERE Discount_Id = @Id;

        IF @@ROWCOUNT = 0
        BEGIN
            COMMIT TRANSACTION;
            SELECT 4 AS Result, CAST(NULL AS INT) AS Id;
            RETURN;
        END

        DELETE FROM dbo.DiscountTargets WHERE Discount_Id = @Id;
        DELETE FROM dbo.DiscountItems WHERE Discount_Id = @Id;
    END

    IF @AppliesTo = N'products'
    BEGIN
        INSERT INTO dbo.DiscountItems (Discount_Id, Product_Id, Variant_Id, New_Price)
        SELECT @Id, items.ProductId, items.VariantId,
               CASE WHEN @DiscountType = N'price' THEN MAX(items.NewPrice) END
        FROM OPENJSON(ISNULL(@Items, N'[]'))
            WITH (ProductId INT '$.productId', VariantId INT '$.variantId', NewPrice DECIMAL(18, 2) '$.newPrice') items
        INNER JOIN dbo.Products p ON p.Product_Id = items.ProductId
        WHERE (items.VariantId = 0 AND ISNULL(p.HasVariants, 0) = 0)
           OR (items.VariantId > 0 AND EXISTS (
                SELECT 1 FROM dbo.ProductVariants pv WHERE pv.Variant_Id = items.VariantId AND pv.Product_Id = items.ProductId))
        GROUP BY items.ProductId, items.VariantId;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.DiscountTargets (Discount_Id, Target_Id)
        SELECT DISTINCT @Id, ids.Id
        FROM @TargetIds ids
        WHERE (@AppliesTo = N'brands' AND EXISTS (SELECT 1 FROM dbo.Brands b WHERE b.Brand_Id = ids.Id))
           OR (@AppliesTo = N'categories' AND EXISTS (SELECT 1 FROM dbo.ProductCategories c WHERE c.Category_Id = ids.Id));
    END

    COMMIT TRANSACTION;

    SELECT 0 AS Result, @Id AS Id;
END
GO
