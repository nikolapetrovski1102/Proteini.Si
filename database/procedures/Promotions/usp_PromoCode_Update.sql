SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_Update
    @PromoCodeId INT,
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
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE PromoCodeId = @PromoCodeId)
    BEGIN
        COMMIT;
        SELECT 4 AS Result;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE Code = @Code AND PromoCodeId <> @PromoCodeId)
    BEGIN
        COMMIT;
        SELECT 1 AS Result;
        RETURN;
    END

    UPDATE dbo.PromoCodes
    SET Code = @Code,
        Description = @Description,
        DiscountType = @DiscountType,
        DiscountValue = @DiscountValue,
        MinimumOrderAmount = @MinimumOrderAmount,
        MaximumDiscountAmount = @MaximumDiscountAmount,
        UsageLimit = @UsageLimit,
        PerCustomerLimit = @PerCustomerLimit,
        ValidFrom = @ValidFrom,
        ValidUntil = @ValidUntil,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE PromoCodeId = @PromoCodeId;

    COMMIT;
    SELECT 0 AS Result;
END
GO
