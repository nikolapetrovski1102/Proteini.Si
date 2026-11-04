SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_DocumentExists
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT COUNT(1)
    FROM dbo.OrderDocuments
    WHERE OrderId = @OrderId AND DocumentType = 'operational-order' AND Version = 1;
END
GO
