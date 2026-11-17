SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Keeps Products.Price equal to the product's lowest active variant price (the "from" price the admin
-- product form shows and saves). Called after every variant create/update/delete, so a size's new price
-- also reaches the places that read the product's own price: favorites, marketing emails, admin list,
-- admin search. The shop, cart, checkout and feed read the variant price directly.
CREATE OR ALTER PROCEDURE dbo.usp_Product_SyncPriceFromVariants
    @ProductId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FromPrice DECIMAL(18, 2) = (
        SELECT MIN(Price) FROM dbo.ProductVariants
        WHERE Product_Id = @ProductId AND IsActive = 1 AND Price > 0);

    IF @FromPrice IS NULL RETURN;

    UPDATE dbo.Products
    SET Price = @FromPrice, UpdatedAt = GETDATE()
    WHERE Product_Id = @ProductId
      AND ISNULL(HasVariants, 0) = 1
      AND ISNULL(IsGiftVoucher, 0) = 0
      AND (Price IS NULL OR Price <> @FromPrice);
END
GO
