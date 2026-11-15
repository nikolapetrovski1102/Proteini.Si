SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Saves the showcase settings and replaces its hand-picked products (Id = product, DisplayOrder = position).
-- Unknown product ids are skipped.
CREATE OR ALTER PROCEDURE dbo.usp_HomeShowcase_Update
    @ShowcaseKey NVARCHAR(40) = N'whats-new',
    @TitleMk NVARCHAR(120) = NULL,
    @TitleAl NVARCHAR(120) = NULL,
    @Source NVARCHAR(20),
    @ItemCount INT,
    @IsActive BIT,
    @UpdatedBy NVARCHAR(256) = NULL,
    @Products dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    MERGE dbo.HomeShowcase WITH (HOLDLOCK) AS target
    USING (SELECT @ShowcaseKey AS Showcase_Key) AS source
        ON target.Showcase_Key = source.Showcase_Key
    WHEN MATCHED THEN
        UPDATE SET Title_Mk = NULLIF(LTRIM(RTRIM(@TitleMk)), N''),
                   Title_Al = NULLIF(LTRIM(RTRIM(@TitleAl)), N''),
                   Source = @Source,
                   Item_Count = @ItemCount,
                   Is_Active = @IsActive,
                   Updated_At = SYSUTCDATETIME(),
                   Updated_By = @UpdatedBy
    WHEN NOT MATCHED THEN
        INSERT (Showcase_Key, Title_Mk, Title_Al, Source, Item_Count, Is_Active, Updated_By)
        VALUES (@ShowcaseKey, NULLIF(LTRIM(RTRIM(@TitleMk)), N''), NULLIF(LTRIM(RTRIM(@TitleAl)), N''),
                @Source, @ItemCount, @IsActive, @UpdatedBy);

    DELETE FROM dbo.HomeShowcaseProducts WHERE Showcase_Key = @ShowcaseKey;

    INSERT INTO dbo.HomeShowcaseProducts (Showcase_Key, Product_Id, Display_Order)
    SELECT @ShowcaseKey, p.Id, MIN(p.DisplayOrder)
    FROM @Products p
    INNER JOIN dbo.Products pr ON pr.Product_Id = p.Id
    GROUP BY p.Id;

    COMMIT TRANSACTION;
END
GO
