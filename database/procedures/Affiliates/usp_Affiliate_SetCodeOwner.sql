SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Assigns an existing promo code to an affiliate (@AffiliateId NULL = unassign). Result: 0 = ok, 4 = code or affiliate not found.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_SetCodeOwner
    @PromoCodeId INT,
    @AffiliateId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @AffiliateId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Affiliates WHERE AffiliateId = @AffiliateId)
    BEGIN
        SELECT 4 AS Result;
        RETURN;
    END

    UPDATE dbo.PromoCodes SET AffiliateId = @AffiliateId, UpdatedAt = GETDATE() WHERE PromoCodeId = @PromoCodeId;
    SELECT CASE WHEN @@ROWCOUNT = 0 THEN 4 ELSE 0 END AS Result;
END
GO
