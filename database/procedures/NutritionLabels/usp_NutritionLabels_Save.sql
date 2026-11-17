SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- @ItemsJson: [{"mk":"...","al":"...","en":"..."}]. Upserts; a label with
-- neither AL nor EN is removed. Returns the number of items processed.
CREATE OR ALTER PROCEDURE dbo.usp_NutritionLabels_Save
    @ItemsJson nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @items TABLE (Mk nvarchar(400) COLLATE Latin1_General_100_BIN2 NOT NULL PRIMARY KEY, Al nvarchar(400) NULL, En nvarchar(400) NULL);

    INSERT INTO @items (Mk, Al, En)
    SELECT j.Mk COLLATE Latin1_General_100_BIN2, MAX(NULLIF(LTRIM(RTRIM(j.Al)), N'')), MAX(NULLIF(LTRIM(RTRIM(j.En)), N''))
    FROM OPENJSON(@ItemsJson)
         WITH (Mk nvarchar(400) '$.mk', Al nvarchar(400) '$.al', En nvarchar(400) '$.en') j
    WHERE NULLIF(LTRIM(RTRIM(j.Mk)), N'') IS NOT NULL
    GROUP BY j.Mk COLLATE Latin1_General_100_BIN2;

    BEGIN TRANSACTION;

    DELETE t
    FROM dbo.NutritionLabelTranslations t
    JOIN @items i ON i.Mk = t.Mk
    WHERE i.Al IS NULL AND i.En IS NULL;

    UPDATE t
    SET t.Al = i.Al, t.En = i.En, t.UpdatedAt = SYSUTCDATETIME()
    FROM dbo.NutritionLabelTranslations t
    JOIN @items i ON i.Mk = t.Mk
    WHERE i.Al IS NOT NULL OR i.En IS NOT NULL;

    INSERT INTO dbo.NutritionLabelTranslations (Mk, Al, En)
    SELECT i.Mk, i.Al, i.En
    FROM @items i
    WHERE (i.Al IS NOT NULL OR i.En IS NOT NULL)
      AND NOT EXISTS (SELECT 1 FROM dbo.NutritionLabelTranslations t WHERE t.Mk = i.Mk);

    COMMIT TRANSACTION;

    SELECT COUNT(*) FROM @items;
END
GO
