IF OBJECT_ID('dbo.PromoCodes', 'U') IS NULL
BEGIN
    THROW 50001, 'PromoCodes does not exist. Run add-promotions-free-gifts-short-expiry-20260924.sql first.', 1;
END;

IF EXISTS (SELECT 1 FROM dbo.PromoCodes WHERE Code = 'TEST20')
BEGIN
    UPDATE dbo.PromoCodes
    SET Description = 'Test coupon - 20% discount',
        DiscountType = 'percentage',
        DiscountValue = 20,
        MinimumOrderAmount = 500,
        MaximumDiscountAmount = 1000,
        UsageLimit = 100,
        PerCustomerLimit = 1,
        ValidFrom = GETDATE(),
        ValidUntil = DATEADD(DAY, 30, GETDATE()),
        IsActive = 1,
        UpdatedAt = GETDATE()
    WHERE Code = 'TEST20';
END
ELSE
BEGIN
    INSERT INTO dbo.PromoCodes
        (Code, Description, DiscountType, DiscountValue, MinimumOrderAmount,
         MaximumDiscountAmount, UsageLimit, PerCustomerLimit, ValidFrom,
         ValidUntil, IsActive, CreatedAt, UpdatedAt)
    VALUES
        ('TEST20', 'Test coupon - 20% discount', 'percentage', 20, 500,
         1000, 100, 1, GETDATE(), DATEADD(DAY, 30, GETDATE()), 1,
         GETDATE(), GETDATE());
END;

SELECT Code, Description, DiscountType, DiscountValue, MinimumOrderAmount,
       MaximumDiscountAmount, UsageLimit, PerCustomerLimit, ValidFrom,
       ValidUntil, IsActive
FROM dbo.PromoCodes
WHERE Code = 'TEST20';
