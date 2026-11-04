SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Order_RegisterDocument
    @OrderId INT,
    @Hash CHAR(64),
    @Html NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.OrderDocuments WITH (UPDLOCK, HOLDLOCK)
        WHERE OrderId = @OrderId AND DocumentType = 'operational-order' AND Version = 1
    )
        INSERT INTO dbo.OrderDocuments (OrderId, DocumentType, Version, GeneratedAt, GeneratedBy, ContentHash, HtmlContent)
        VALUES (@OrderId, 'operational-order', 1, SYSUTCDATETIME(), 'system', @Hash, @Html);

    COMMIT TRANSACTION;
END
GO
