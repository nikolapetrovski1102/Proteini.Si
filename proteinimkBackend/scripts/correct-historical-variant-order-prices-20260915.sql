SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF OBJECT_ID('dbo.Orders_Backup_VariantPriceFix_20260915', 'U') IS NOT NULL
    THROW 50001, 'The order backup table already exists; correction was not run again.', 1;

IF OBJECT_ID('dbo.OrderItems_Backup_VariantPriceFix_20260915', 'U') IS NOT NULL
    THROW 50002, 'The order-item backup table already exists; correction was not run again.', 1;

;WITH AffectedOrders AS
(
    SELECT DISTINCT o.Order_Id
    FROM dbo.Orders o
    INNER JOIN dbo.OrderItems oi ON oi.Order_Id = o.Order_Id
    INNER JOIN dbo.ProductVariants pv
        ON pv.Variant_Id = oi.Variant_Id
        AND pv.Product_Id = oi.Product_Id
    WHERE o.User_Id IS NULL
      AND ABS(
          oi.Product_Price
          - CASE
                WHEN pv.Compare_Price IS NOT NULL
                     AND pv.Compare_Price > 0
                     AND pv.Compare_Price < pv.Price
                    THEN pv.Compare_Price
                ELSE pv.Price
            END
      ) > 0.01
)
SELECT o.*
INTO dbo.Orders_Backup_VariantPriceFix_20260915
FROM dbo.Orders o
INNER JOIN AffectedOrders affected ON affected.Order_Id = o.Order_Id;

SELECT oi.*
INTO dbo.OrderItems_Backup_VariantPriceFix_20260915
FROM dbo.OrderItems oi
INNER JOIN dbo.Orders_Backup_VariantPriceFix_20260915 backupOrder
    ON backupOrder.Order_Id = oi.Order_Id;

UPDATE oi
SET Product_Price = resolvedPrice.EffectivePrice,
    Subtotal = resolvedPrice.EffectivePrice * oi.Quantity,
    LoyaltyPointsEarned = FLOOR(
        (resolvedPrice.EffectivePrice * oi.Quantity)
        * (COALESCE(oi.LoyaltyPercentage, 2.0) / 100.0)
    )
FROM dbo.OrderItems oi
INNER JOIN dbo.Orders_Backup_VariantPriceFix_20260915 backupOrder
    ON backupOrder.Order_Id = oi.Order_Id
INNER JOIN dbo.ProductVariants pv
    ON pv.Variant_Id = oi.Variant_Id
    AND pv.Product_Id = oi.Product_Id
CROSS APPLY
(
    SELECT CASE
        WHEN pv.Compare_Price IS NOT NULL
             AND pv.Compare_Price > 0
             AND pv.Compare_Price < pv.Price
            THEN pv.Compare_Price
        ELSE pv.Price
    END AS EffectivePrice
) resolvedPrice;

;WITH Recalculated AS
(
    SELECT
        oi.Order_Id,
        SUM(oi.Subtotal) AS CorrectedSubtotal,
        SUM(COALESCE(oi.LoyaltyPointsEarned, 0)) AS CorrectedPointsEarned
    FROM dbo.OrderItems oi
    INNER JOIN dbo.Orders_Backup_VariantPriceFix_20260915 backupOrder
        ON backupOrder.Order_Id = oi.Order_Id
    GROUP BY oi.Order_Id
), Corrected AS
(
    SELECT
        o.Order_Id,
        recalculated.CorrectedSubtotal,
        recalculated.CorrectedPointsEarned,
        CASE
            WHEN recalculated.CorrectedSubtotal >= 3000 THEN CAST(0 AS decimal(18, 2))
            WHEN o.Delivery_Fee > 0 THEN o.Delivery_Fee
            ELSE CAST(180 AS decimal(18, 2))
        END AS CorrectedDeliveryFee
    FROM dbo.Orders o
    INNER JOIN Recalculated recalculated ON recalculated.Order_Id = o.Order_Id
)
UPDATE o
SET Subtotal = corrected.CorrectedSubtotal,
    Delivery_Fee = corrected.CorrectedDeliveryFee,
    Total_Amount =
        CASE
            WHEN corrected.CorrectedSubtotal - COALESCE(o.Points_Discount, 0) < 0 THEN 0
            ELSE corrected.CorrectedSubtotal - COALESCE(o.Points_Discount, 0)
        END + corrected.CorrectedDeliveryFee,
    Points_Earned = corrected.CorrectedPointsEarned,
    Updated_At = GETDATE()
FROM dbo.Orders o
INNER JOIN Corrected corrected ON corrected.Order_Id = o.Order_Id;

SELECT
    o.Order_Id,
    o.Order_Number,
    backupOrder.Subtotal AS PreviousSubtotal,
    o.Subtotal AS CorrectedSubtotal,
    backupOrder.Delivery_Fee AS PreviousDeliveryFee,
    o.Delivery_Fee AS CorrectedDeliveryFee,
    backupOrder.Total_Amount AS PreviousTotal,
    o.Total_Amount AS CorrectedTotal
FROM dbo.Orders o
INNER JOIN dbo.Orders_Backup_VariantPriceFix_20260915 backupOrder
    ON backupOrder.Order_Id = o.Order_Id
ORDER BY o.Order_Date DESC;

COMMIT TRANSACTION;
