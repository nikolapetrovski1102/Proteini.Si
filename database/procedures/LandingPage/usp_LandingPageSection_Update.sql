SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_LandingPageSection_Update
    @Id INT,
    @SectionType NVARCHAR(4000),
    @Title NVARCHAR(4000) = NULL,
    @ImagePath NVARCHAR(4000) = NULL,
    @Content NVARCHAR(MAX) = NULL,
    @DisplayOrder INT = 0,
    @IsActive BIT,
    @UpdatedBy NVARCHAR(4000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.LandingPageSections
    SET SectionType = @SectionType,
        Title = @Title,
        ImagePath = @ImagePath,
        Content = @Content,
        DisplayOrder = @DisplayOrder,
        IsActive = @IsActive,
        UpdatedAt = GETDATE(),
        UpdatedBy = @UpdatedBy
    WHERE Id = @Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
