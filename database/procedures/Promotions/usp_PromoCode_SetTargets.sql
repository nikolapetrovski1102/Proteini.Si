SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Saves which products a promo code applies to. Called by the create/update procedures inside
-- their transaction. @AppliesTo NULL keeps the current scope (older API builds don't send it).
-- Unknown product/category ids are ignored.
CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_SetTargets
    @PromoCodeId INT,
    @AppliesTo NVARCHAR(20),
    @ProductIds dbo.IntList READONLY,
    @CategoryIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @AppliesTo IS NULL RETURN;
    IF @AppliesTo NOT IN (N'all', N'products', N'categories') SET @AppliesTo = N'all';

    UPDATE dbo.PromoCodes SET AppliesTo = @AppliesTo WHERE PromoCodeId = @PromoCodeId;
    DELETE FROM dbo.PromoCodeTargets WHERE PromoCodeId = @PromoCodeId;

    IF @AppliesTo = N'products'
        INSERT INTO dbo.PromoCodeTargets (PromoCodeId, TargetType, TargetId)
        SELECT @PromoCodeId, N'product', p.Product_Id
        FROM dbo.Products p
        INNER JOIN @ProductIds ids ON ids.Id = p.Product_Id;

    IF @AppliesTo = N'categories'
        INSERT INTO dbo.PromoCodeTargets (PromoCodeId, TargetType, TargetId)
        SELECT @PromoCodeId, N'category', c.Category_Id
        FROM dbo.ProductCategories c
        INNER JOIN @CategoryIds ids ON ids.Id = c.Category_Id;
END
GO
