SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_Create
    @ImageUrl NVARCHAR(4000),
    @MobileImageUrl NVARCHAR(4000) = NULL,
    @ClickUrl NVARCHAR(4000) = NULL,
    @Title NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @DisplayOrder INT = (SELECT ISNULL(MAX(DisplayOrder), -1) + 1 FROM dbo.HomeSliders WITH (UPDLOCK, HOLDLOCK));

    INSERT INTO dbo.HomeSliders (ImageUrl, MobileImageUrl, ClickUrl, Title, DisplayOrder, IsActive, CreatedAt, UpdatedAt)
    VALUES (@ImageUrl, @MobileImageUrl, @ClickUrl, @Title, @DisplayOrder, 1, GETDATE(), GETDATE());

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id, @DisplayOrder AS DisplayOrder;

    COMMIT TRANSACTION;
END
GO
