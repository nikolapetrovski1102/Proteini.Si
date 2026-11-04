SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_Create
    @UserId INT = NULL,
    @OrderNumberPrefix NVARCHAR(20),
    @OrderStatus NVARCHAR(50),
    @PaymentMethod NVARCHAR(50),
    @BillingType NVARCHAR(4000),
    @BillingFullName NVARCHAR(4000),
    @BillingAddress NVARCHAR(4000),
    @BillingPostCode NVARCHAR(4000),
    @BillingCity NVARCHAR(4000),
    @BillingCountry NVARCHAR(4000),
    @BillingPhone NVARCHAR(4000),
    @BillingEmail NVARCHAR(4000),
    @BillingTaxNumber NVARCHAR(4000) = NULL,
    @BillingCompanyName NVARCHAR(4000) = NULL,
    @DeliveryIsDifferent BIT,
    @DeliveryFullName NVARCHAR(4000) = NULL,
    @DeliveryAddress NVARCHAR(4000) = NULL,
    @DeliveryPostCode NVARCHAR(4000) = NULL,
    @DeliveryCity NVARCHAR(4000) = NULL,
    @DeliveryCountry NVARCHAR(4000) = NULL,
    @DeliveryPhone NVARCHAR(4000) = NULL,
    @Subtotal DECIMAL(38, 10),
    @DeliveryFee DECIMAL(38, 10),
    @TotalAmount DECIMAL(38, 10),
    @OrderNote NVARCHAR(MAX) = NULL,
    @Now DATETIME2,
    @PromoCodeId INT = NULL,
    @PromoCode NVARCHAR(4000) = NULL,
    @PromoDiscount DECIMAL(38, 10),
    @GiftVoucherId INT = NULL,
    @GiftVoucherCode NVARCHAR(4000) = NULL,
    @GiftVoucherAmount DECIMAL(38, 10),
    @AmountBeforeVoucher DECIMAL(38, 10),
    @FreeGiftId INT = NULL,
    @FreeGiftProductId INT = NULL,
    @FreeGiftVariantId INT = NULL,
    @FreeGiftDisplayName NVARCHAR(4000) = NULL,
    @PointsRedeemed DECIMAL(38, 10),
    @PointsDiscount DECIMAL(38, 10),
    @PointsEarned DECIMAL(38, 10),
    @PointsText NVARCHAR(100),
    @CartId INT = NULL,
    @Items NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF @PromoCodeId IS NOT NULL
    BEGIN
        DECLARE @PromoValid BIT = 0;

        SELECT @PromoValid = CASE WHEN pc.IsActive = 1
            AND (pc.ValidFrom IS NULL OR @Now >= pc.ValidFrom)
            AND (pc.ValidUntil IS NULL OR @Now <= pc.ValidUntil)
            AND @Subtotal >= pc.MinimumOrderAmount
            AND (pc.UsageLimit IS NULL
                 OR (SELECT COUNT(*) FROM dbo.PromoCodeUsages u WHERE u.PromoCodeId = pc.PromoCodeId) < pc.UsageLimit)
            AND (pc.PerCustomerLimit IS NULL
                 OR (SELECT COUNT(*) FROM dbo.PromoCodeUsages u
                     WHERE u.PromoCodeId = pc.PromoCodeId
                       AND ((ISNULL(@UserId, 0) > 0 AND u.UserId = @UserId)
                            OR (ISNULL(@UserId, 0) <= 0 AND LOWER(u.CustomerEmail) = LOWER(@BillingEmail)))) < pc.PerCustomerLimit)
            THEN 1 ELSE 0 END
        FROM dbo.PromoCodes pc WITH (UPDLOCK, HOLDLOCK)
        WHERE pc.PromoCodeId = @PromoCodeId;

        IF @PromoValid = 0
            THROW 50001, 'The promotion code has just reached its limit or is no longer available.', 1;
    END

    IF @GiftVoucherId IS NOT NULL
    BEGIN
        DECLARE @VoucherValid BIT = 0;

        SELECT @VoucherValid = CASE WHEN v.Status = 'active'
            AND v.ValidFrom <= SYSUTCDATETIME()
            AND (v.ExpiresAt IS NULL OR v.ExpiresAt >= SYSUTCDATETIME())
            AND ROUND(CASE WHEN v.RemainingValue < @AmountBeforeVoucher THEN v.RemainingValue ELSE @AmountBeforeVoucher END, 2) > 0
            AND ROUND(CASE WHEN v.RemainingValue < @AmountBeforeVoucher THEN v.RemainingValue ELSE @AmountBeforeVoucher END, 2) = @GiftVoucherAmount
            THEN 1 ELSE 0 END
        FROM dbo.GiftVouchers v WITH (UPDLOCK, HOLDLOCK)
        WHERE v.GiftVoucherId = @GiftVoucherId;

        IF @VoucherValid = 0
            THROW 50002, 'The gift voucher balance changed or is no longer available. Please review the order and try again.', 1;
    END

    DECLARE @OrderNumber NVARCHAR(50);
    DECLARE @Attempts INT = 0;
    WHILE 1 = 1
    BEGIN
        SET @OrderNumber = CONCAT(@OrderNumberPrefix, 1000 + ABS(CHECKSUM(NEWID())) % 8999);
        IF NOT EXISTS (SELECT 1 FROM dbo.Orders WITH (UPDLOCK, HOLDLOCK) WHERE Order_Number = @OrderNumber)
            BREAK;
        SET @Attempts += 1;
        IF @Attempts >= 50
            THROW 50003, 'Failed to create order', 1;
    END

    INSERT INTO dbo.Orders (
        User_Id, Order_Number, Order_Date, Order_Status, Payment_Method, Payment_Status,
        Billing_Type, Billing_FullName, Billing_Address, Billing_PostCode, Billing_City,
        Billing_Country, Billing_Phone, Billing_Email, Billing_TaxNumber, Billing_CompanyName,
        Delivery_IsDifferent, Delivery_FullName, Delivery_Address, Delivery_PostCode,
        Delivery_City, Delivery_Country, Delivery_Phone,
        Subtotal, Delivery_Fee, VAT_Amount, Total_Amount, Order_Note, Gift_Voucher_Code, Gift_Voucher_Amount,
        Promo_Code, Promo_Discount, Selected_Free_Gift_Id,
        Points_Redeemed, Points_Discount, Points_Earned,
        Created_At, Updated_At
    ) VALUES (
        @UserId, @OrderNumber, GETDATE(), @OrderStatus, @PaymentMethod, 'pending',
        @BillingType, @BillingFullName, @BillingAddress, @BillingPostCode, @BillingCity,
        @BillingCountry, @BillingPhone, @BillingEmail, @BillingTaxNumber, @BillingCompanyName,
        @DeliveryIsDifferent, @DeliveryFullName, @DeliveryAddress, @DeliveryPostCode,
        @DeliveryCity, @DeliveryCountry, @DeliveryPhone,
        @Subtotal, @DeliveryFee, 0, @TotalAmount, @OrderNote, @GiftVoucherCode, @GiftVoucherAmount,
        @PromoCode, @PromoDiscount, @FreeGiftId,
        @PointsRedeemed, @PointsDiscount, @PointsEarned,
        GETDATE(), GETDATE()
    );

    DECLARE @OrderId INT = CAST(SCOPE_IDENTITY() AS INT);

    IF @PromoCodeId IS NOT NULL
        INSERT INTO dbo.PromoCodeUsages (PromoCodeId, OrderId, UserId, CustomerEmail, DiscountAmount, UsedAt)
        VALUES (@PromoCodeId, @OrderId, @UserId, @BillingEmail, @PromoDiscount, GETDATE());

    IF @GiftVoucherId IS NOT NULL
    BEGIN
        UPDATE dbo.GiftVouchers
        SET RemainingValue = RemainingValue - @GiftVoucherAmount,
            Status = CASE WHEN RemainingValue - @GiftVoucherAmount <= 0 THEN 'depleted' ELSE 'active' END,
            UpdatedAt = SYSUTCDATETIME()
        WHERE GiftVoucherId = @GiftVoucherId AND RemainingValue >= @GiftVoucherAmount;

        IF @@ROWCOUNT <> 1
            THROW 50004, 'The gift voucher balance changed. Please try again.', 1;

        INSERT INTO dbo.GiftVoucherRedemptions (GiftVoucherId, OrderId, Amount, Status, CreatedAt)
        VALUES (@GiftVoucherId, @OrderId, @GiftVoucherAmount, 'reserved', SYSUTCDATETIME());
    END

    IF @FreeGiftId IS NOT NULL
    BEGIN
        IF @FreeGiftVariantId IS NOT NULL
            UPDATE dbo.ProductVariants
            SET Quantity = Quantity - 1, Updated_At = GETDATE()
            WHERE Variant_Id = @FreeGiftVariantId AND Product_Id = @FreeGiftProductId AND IsActive = 1 AND Quantity > 0;
        ELSE
            UPDATE dbo.Products
            SET Quantity = Quantity - 1, UpdatedAt = GETDATE()
            WHERE Product_Id = @FreeGiftProductId AND HasVariants = 0 AND Quantity > 0;

        IF @@ROWCOUNT <> 1
            THROW 50005, 'The selected free gift has just gone out of stock. Please choose another gift.', 1;

        INSERT INTO dbo.OrderFreeGifts (OrderId, FreeGiftId, ProductId, VariantId, DisplayName, CreatedAt)
        VALUES (@OrderId, @FreeGiftId, @FreeGiftProductId, @FreeGiftVariantId, @FreeGiftDisplayName, GETDATE());
    END

    IF @PointsRedeemed > 0 AND ISNULL(@UserId, 0) > 0
        INSERT INTO dbo.LoyaltyPoints (UserId, Points, PointsType, SourceType, SourceId, Description, TransactionDate)
        VALUES (@UserId, @PointsRedeemed, 'redeemed', 'order', @OrderId,
                CONCAT(N'Redeemed ', @PointsText, N' points for order #', @OrderNumber), GETDATE());

    DECLARE @ItemCount INT = (SELECT COUNT(*) FROM OPENJSON(@Items));
    DECLARE @Index INT = 0;
    DECLARE @ProductId INT, @VariantId INT, @VariantName NVARCHAR(4000), @VariantPackaging NVARCHAR(4000),
            @ProductName NVARCHAR(4000), @ProductPrice DECIMAL(38, 10), @Quantity INT, @ItemSubtotal DECIMAL(38, 10),
            @LoyaltyPercentage DECIMAL(38, 10), @LoyaltyPointsEarned INT, @Message NVARCHAR(2048);

    WHILE @Index < @ItemCount
    BEGIN
        SELECT
            @ProductId = j.ProductId, @VariantId = j.VariantId, @VariantName = j.VariantName,
            @VariantPackaging = j.VariantPackaging, @ProductName = j.ProductName, @ProductPrice = j.ProductPrice,
            @Quantity = j.Quantity, @ItemSubtotal = j.Subtotal, @LoyaltyPercentage = j.LoyaltyPercentage,
            @LoyaltyPointsEarned = j.LoyaltyPointsEarned
        FROM OPENJSON(@Items, CONCAT('$[', @Index, ']')) WITH (
            ProductId INT '$.ProductId',
            VariantId INT '$.VariantId',
            VariantName NVARCHAR(4000) '$.VariantName',
            VariantPackaging NVARCHAR(4000) '$.VariantPackaging',
            ProductName NVARCHAR(4000) '$.ProductName',
            ProductPrice DECIMAL(38, 10) '$.ProductPrice',
            Quantity INT '$.Quantity',
            Subtotal DECIMAL(38, 10) '$.Subtotal',
            LoyaltyPercentage DECIMAL(38, 10) '$.LoyaltyPercentage',
            LoyaltyPointsEarned INT '$.LoyaltyPointsEarned'
        ) j;

        INSERT INTO dbo.OrderItems (
            Order_Id, Product_Id, Variant_Id, Variant_Name, Variant_Packaging,
            Product_Name, Product_Price, Quantity, Subtotal,
            LoyaltyPercentage, LoyaltyPointsEarned, Created_At
        ) VALUES (
            @OrderId, @ProductId, @VariantId, @VariantName, @VariantPackaging,
            @ProductName, @ProductPrice, @Quantity, @ItemSubtotal,
            @LoyaltyPercentage, @LoyaltyPointsEarned, GETDATE()
        );

        IF @VariantId IS NOT NULL AND @VariantId > 0
            UPDATE dbo.ProductVariants
            SET Quantity = Quantity - @Quantity, Updated_At = GETDATE()
            WHERE Variant_Id = @VariantId AND IsActive = 1 AND Quantity >= @Quantity;
        ELSE
            UPDATE dbo.Products
            SET Quantity = Quantity - @Quantity
            WHERE Product_Id = @ProductId AND HasVariants = 0 AND Quantity >= @Quantity;

        IF @@ROWCOUNT <> 1
        BEGIN
            SET @Message = CONCAT(N'Insufficient stock for product: ', @ProductName, N'.');
            THROW 50006, @Message, 1;
        END

        SET @Index += 1;
    END

    IF @CartId IS NOT NULL
        DELETE FROM dbo.CartItems WHERE Cart_Id = @CartId;

    COMMIT TRANSACTION;

    SELECT @OrderId AS OrderId, @OrderNumber AS OrderNumber;
END
GO
