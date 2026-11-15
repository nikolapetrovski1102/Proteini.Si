SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Stores one storefront event (page_view, cart_add, checkout_start, order_created)
-- or a server-side lead event (checkout_email).
CREATE OR ALTER PROCEDURE dbo.usp_SiteEvent_Add
    @VisitorId NVARCHAR(64),
    @EventType NVARCHAR(32),
    @UserId INT,
    @OrderId INT,
    @Email NVARCHAR(320),
    @FullName NVARCHAR(200),
    @Path NVARCHAR(300),
    @Referrer NVARCHAR(300)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.SiteEvents (VisitorId, EventType, UserId, OrderId, Email, FullName, Path, Referrer, CreatedAt)
    VALUES (@VisitorId, @EventType, @UserId, @OrderId, @Email, @FullName, @Path, @Referrer, GETDATE());
END
GO
