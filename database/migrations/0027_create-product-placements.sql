-- 2026-11-15 pinned products in the shop listing: the admin pins products to the top of a category listing, a brand
-- listing, or the whole shop (Scope 'all', Target_Id 0). Pins only change the default "Recommended" order; a sort the
-- shopper picks (price, newest, ...) and search results ignore them. Additive and idempotent; older API builds keep
-- working.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.ProductPlacements', 'U') IS NULL
    CREATE TABLE dbo.ProductPlacements
    (
        Scope NVARCHAR(10) NOT NULL
            CONSTRAINT CK_ProductPlacements_Scope CHECK (Scope IN (N'all', N'category', N'brand')),
        Target_Id INT NOT NULL,
        Product_Id INT NOT NULL
            CONSTRAINT FK_ProductPlacements_Products REFERENCES dbo.Products (Product_Id) ON DELETE CASCADE,
        Position INT NOT NULL,
        Updated_At DATETIME2 NOT NULL CONSTRAINT DF_ProductPlacements_UpdatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_ProductPlacements PRIMARY KEY (Scope, Target_Id, Product_Id)
    );
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProductPlacements_Product' AND object_id = OBJECT_ID('dbo.ProductPlacements'))
    CREATE INDEX IX_ProductPlacements_Product ON dbo.ProductPlacements (Product_Id) INCLUDE (Scope, Target_Id, Position);
GO
