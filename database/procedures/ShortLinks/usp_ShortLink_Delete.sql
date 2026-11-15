SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Result: 0 = deleted, 4 = not found. Daily click rows cascade.
CREATE OR ALTER PROCEDURE dbo.usp_ShortLink_Delete
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.ShortLinks WHERE ShortLinkId = @Id;
    SELECT CASE WHEN @@ROWCOUNT = 0 THEN 4 ELSE 0 END AS Result;
END
GO
