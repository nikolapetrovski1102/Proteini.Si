SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Creates a promo code owned by an affiliate. Result: 0 = created, 1 = code exists, 4 = affiliate not found.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_AddCode
    @AffiliateId INT,
    @Code NVARCHAR(4000),
    @Description NVARCHAR(4000),
    @DiscountType NVARCHAR(4000),
    @DiscountValue DECIMAL(38, 10),
    @MinimumOrderAmount DECIMAL(38, 10),
    @MaximumDiscountAmount DECIMAL(38, 10),
    @UsageLimit INT,
    @PerCustomerLimit INT,
    @ValidFrom DATETIME2,
    @ValidUntil DATETIME2,
    @IsActive BIT,
    @AppliesTo NVARCHAR(20) = NULL,
    @ProductIds dbo.IntList READONLY,
    @CategoryIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.Affiliates WHERE AffiliateId = @AffiliateId)
    BEGIN
        COMMIT;
        SELECT 4 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE Code = @Code)
    BEGIN
        COMMIT;
        SELECT 1 AS Result, CAST(NULL AS INT) AS Id;
        RETURN;
    END

    INSERT INTO dbo.PromoCodes
        (Code, Description, DiscountType, DiscountValue, MinimumOrderAmount, MaximumDiscountAmount,
         UsageLimit, PerCustomerLimit, ValidFrom, ValidUntil, IsActive, AffiliateId, CreatedAt, UpdatedAt)
    VALUES
        (@Code, @Description, @DiscountType, @DiscountValue, @MinimumOrderAmount, @MaximumDiscountAmount,
         @UsageLimit, @PerCustomerLimit, @ValidFrom, @ValidUntil, @IsActive, @AffiliateId, GETDATE(), GETDATE());

    DECLARE @Id INT = CAST(SCOPE_IDENTITY() AS INT);
    EXEC dbo.usp_PromoCode_SetTargets @Id, @AppliesTo, @ProductIds, @CategoryIds;

    COMMIT;
    SELECT 0 AS Result, @Id AS Id;
END
GO
