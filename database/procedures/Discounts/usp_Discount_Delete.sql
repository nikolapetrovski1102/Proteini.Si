SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Deletes a discount (targets cascade). The API runs usp_Discount_Sync right after, which puts the
-- products' previous prices back. Returns 1 when deleted, 0 when not found.
CREATE OR ALTER PROCEDURE dbo.usp_Discount_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.Discounts WHERE Discount_Id = @Id;
    SELECT @@ROWCOUNT;
END
GO
