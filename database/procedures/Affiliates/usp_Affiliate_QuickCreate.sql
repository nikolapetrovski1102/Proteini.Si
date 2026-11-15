SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- One-step setup: affiliate + its promo code + a short link carrying the code, all or nothing.
-- Result: 0 = created, 1 = code exists, 2 = slug exists.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_QuickCreate
    @Name NVARCHAR(4000),
    @Handle NVARCHAR(4000),
    @Email NVARCHAR(4000),
    @Phone NVARCHAR(4000),
    @CommissionPercent DECIMAL(38, 10),
    @Notes NVARCHAR(4000),
    @IsActive BIT,
    @Code NVARCHAR(4000),
    @DiscountType NVARCHAR(4000),
    @DiscountValue DECIMAL(38, 10),
    @MinimumOrderAmount DECIMAL(38, 10),
    @PerCustomerLimit INT,
    @ValidUntil DATETIME2,
    @Slug NVARCHAR(4000),
    @TargetPath NVARCHAR(4000),
    @AppliesTo NVARCHAR(20) = NULL,
    @ProductIds dbo.IntList READONLY,
    @CategoryIds dbo.IntList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE Code = @Code)
    BEGIN
        COMMIT;
        SELECT 1 AS Result, CAST(NULL AS INT) AS AffiliateId, CAST(NULL AS INT) AS PromoCodeId, CAST(NULL AS INT) AS ShortLinkId;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.ShortLinks WITH (UPDLOCK, HOLDLOCK) WHERE Slug = @Slug)
    BEGIN
        COMMIT;
        SELECT 2 AS Result, CAST(NULL AS INT) AS AffiliateId, CAST(NULL AS INT) AS PromoCodeId, CAST(NULL AS INT) AS ShortLinkId;
        RETURN;
    END

    INSERT INTO dbo.Affiliates (Name, Handle, Email, Phone, CommissionPercent, Notes, IsActive, CreatedAt, UpdatedAt)
    VALUES (@Name, @Handle, @Email, @Phone, @CommissionPercent, @Notes, @IsActive, GETDATE(), GETDATE());
    DECLARE @AffiliateId INT = CAST(SCOPE_IDENTITY() AS INT);

    INSERT INTO dbo.PromoCodes
        (Code, Description, DiscountType, DiscountValue, MinimumOrderAmount, MaximumDiscountAmount,
         UsageLimit, PerCustomerLimit, ValidFrom, ValidUntil, IsActive, AffiliateId, CreatedAt, UpdatedAt)
    VALUES
        (@Code, CONCAT(N'Affiliate: ', @Name), @DiscountType, @DiscountValue, @MinimumOrderAmount, NULL,
         NULL, @PerCustomerLimit, NULL, @ValidUntil, @IsActive, @AffiliateId, GETDATE(), GETDATE());
    DECLARE @PromoCodeId INT = CAST(SCOPE_IDENTITY() AS INT);

    EXEC dbo.usp_PromoCode_SetTargets @PromoCodeId, @AppliesTo, @ProductIds, @CategoryIds;

    INSERT INTO dbo.ShortLinks (Slug, TargetPath, PromoCodeId, AffiliateId, Label, IsActive, CreatedAt, UpdatedAt)
    VALUES (@Slug, @TargetPath, @PromoCodeId, @AffiliateId, @Name, @IsActive, GETDATE(), GETDATE());
    DECLARE @ShortLinkId INT = CAST(SCOPE_IDENTITY() AS INT);

    COMMIT;
    SELECT 0 AS Result, @AffiliateId AS AffiliateId, @PromoCodeId AS PromoCodeId, @ShortLinkId AS ShortLinkId;
END
GO
