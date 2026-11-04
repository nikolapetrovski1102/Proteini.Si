SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_GiftVoucher_GetByCode
    @Code NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT GiftVoucherId, Code, RemainingValue, Status, ValidFrom, ExpiresAt
    FROM dbo.GiftVouchers
    WHERE Code = @Code;
END
GO
