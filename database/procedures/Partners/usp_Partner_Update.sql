SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Partner_Update
    @Id INT,
    @Type NVARCHAR(4000),
    @Name NVARCHAR(4000),
    @ImagePath NVARCHAR(4000),
    @Url NVARCHAR(4000) = NULL,
    @DisplayOrder INT = 0,
    @IsActive BIT,
    @UpdatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.Partners
    SET Type = @Type,
        Name = @Name,
        ImagePath = @ImagePath,
        Url = @Url,
        DisplayOrder = @DisplayOrder,
        IsActive = @IsActive,
        UpdatedAt = GETDATE(),
        UpdatedBy = @UpdatedBy
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
