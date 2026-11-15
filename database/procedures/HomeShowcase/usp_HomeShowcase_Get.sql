SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Home page showcase ("Ново во продавница"): settings row, then the hand-picked product ids in display order.
CREATE OR ALTER PROCEDURE dbo.usp_HomeShowcase_Get
    @ShowcaseKey NVARCHAR(40) = N'whats-new'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Showcase_Key, Title_Mk, Title_Al, Source, Item_Count, Is_Active, Updated_At, Updated_By
    FROM dbo.HomeShowcase
    WHERE Showcase_Key = @ShowcaseKey;

    SELECT sp.Product_Id
    FROM dbo.HomeShowcaseProducts sp
    WHERE sp.Showcase_Key = @ShowcaseKey
    ORDER BY sp.Display_Order, sp.Product_Id;
END
GO
