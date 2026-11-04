SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_Create
    @Type NVARCHAR(4000),
    @Name NVARCHAR(4000),
    @ImagePath NVARCHAR(4000),
    @Url NVARCHAR(4000) = NULL,
    @DisplayOrder INT = 0,
    @CreatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF @DisplayOrder <= 0
        SELECT @DisplayOrder = ISNULL(MAX(DisplayOrder), -1) + 1 FROM dbo.Partners WHERE Type = @Type;

    INSERT INTO dbo.Partners (Type, Name, ImagePath, Url, DisplayOrder, CreatedBy)
    VALUES (@Type, @Name, @ImagePath, @Url, @DisplayOrder, @CreatedBy);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
