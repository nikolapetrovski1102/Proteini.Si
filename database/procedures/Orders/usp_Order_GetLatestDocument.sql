SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_GetLatestDocument
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1 d.HtmlContent, o.Order_Number
    FROM dbo.OrderDocuments d
    INNER JOIN dbo.Orders o ON o.Order_Id = d.OrderId
    WHERE d.OrderId = @OrderId AND d.DocumentType = 'operational-order'
    ORDER BY d.Version DESC;
END
GO
