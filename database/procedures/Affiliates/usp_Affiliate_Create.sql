SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Affiliate_Create
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

    INSERT INTO dbo.Affiliates (Name, Handle, Email, Phone, CommissionPercent, Notes, IsActive, CreatedAt, UpdatedAt)
    VALUES (@Name, @Handle, @Email, @Phone, @CommissionPercent, @Notes, @IsActive, GETDATE(), GETDATE());

    SELECT 0 AS Result, CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
