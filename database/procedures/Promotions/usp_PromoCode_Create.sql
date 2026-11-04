SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_PromoCode_Create
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

    IF EXISTS (SELECT 1 FROM dbo.PromoCodes WITH (UPDLOCK, HOLDLOCK) WHERE Code = @Code)
    BEGIN
        COMMIT;
        SELECT 1 AS Result, CAST(NULL AS INT) AS PromoCodeId;
        RETURN;
    END

    INSERT INTO dbo.PromoCodes
        (Code, Description, DiscountType, DiscountValue, MinimumOrderAmount,
         MaximumDiscountAmount, UsageLimit, PerCustomerLimit, ValidFrom, ValidUntil,
         IsActive, CreatedAt, UpdatedAt)
    VALUES
        (@Code, @Description, @DiscountType, @DiscountValue, @MinimumOrderAmount,
         @MaximumDiscountAmount, @UsageLimit, @PerCustomerLimit, @ValidFrom, @ValidUntil,
         @IsActive, GETDATE(), GETDATE());

    DECLARE @PromoCodeId INT = CAST(SCOPE_IDENTITY() AS INT);
    COMMIT;

    SELECT 0 AS Result, @PromoCodeId AS PromoCodeId;
END
GO
