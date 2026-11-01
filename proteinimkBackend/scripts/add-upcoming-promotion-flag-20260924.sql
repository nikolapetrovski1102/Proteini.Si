IF COL_LENGTH('dbo.Products', 'UpcomingPromotion') IS NULL
BEGIN
    ALTER TABLE dbo.Products
        ADD UpcomingPromotion bit NOT NULL
            CONSTRAINT DF_Products_UpcomingPromotion DEFAULT (0);
END;
