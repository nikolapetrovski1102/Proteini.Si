SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_Reorder
    @Items dbo.IdOrderList READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    SELECT item.Id AS MissingId
    INTO #Missing
    FROM @Items item
    WHERE NOT EXISTS (SELECT 1 FROM dbo.HomeSliders WITH (UPDLOCK, HOLDLOCK) WHERE Id = item.Id);

    IF NOT EXISTS (SELECT 1 FROM #Missing)
    BEGIN
        UPDATE slider
        SET DisplayOrder = item.DisplayOrder,
            UpdatedAt = GETDATE()
        FROM dbo.HomeSliders slider
        INNER JOIN @Items item ON item.Id = slider.Id;
    END

    COMMIT TRANSACTION;

    SELECT MissingId FROM #Missing;
END
GO
