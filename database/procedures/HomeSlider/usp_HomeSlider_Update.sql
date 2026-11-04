SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_HomeSlider_Update
    @Id INT,
    @ClickUrl NVARCHAR(4000) = NULL,
    @Title NVARCHAR(4000) = NULL,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.HomeSliders
    SET ClickUrl = @ClickUrl,
        Title = @Title,
        IsActive = @IsActive,
        UpdatedAt = GETDATE()
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
