SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 = updated, 4 = not found.
CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_Update
    @AffiliateId INT,
    @Name NVARCHAR(4000),
    @Handle NVARCHAR(4000),
    @Email NVARCHAR(4000),
    @Phone NVARCHAR(4000),
    @CommissionPercent DECIMAL(38, 10),
    @Notes NVARCHAR(4000),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Affiliates
    SET Name = @Name, Handle = @Handle, Email = @Email, Phone = @Phone,
        CommissionPercent = @CommissionPercent, Notes = @Notes, IsActive = @IsActive, UpdatedAt = GETDATE()
    WHERE AffiliateId = @AffiliateId;

    SELECT CASE WHEN @@ROWCOUNT = 0 THEN 4 ELSE 0 END AS Result;
END
GO
