SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_DynamicSection_Update
    @Section_Id INT,
    @Section_Type NVARCHAR(4000),
    @Title_Text NVARCHAR(4000),
    @Content_Text NVARCHAR(MAX),
    @Display_Order INT,
    @IsActive BIT,
    @IsBold BIT,
    @IsItalic BIT,
    @IsUnderline BIT,
    @Text_Align NVARCHAR(4000),
    @Font_Size NVARCHAR(4000) = NULL,
    @Text_Color NVARCHAR(4000) = NULL,
    @Margin_Top INT = NULL,
    @Margin_Bottom INT = NULL,
    @Padding_Top INT = NULL,
    @Padding_Bottom INT = NULL,
    @Custom_CSS_Class NVARCHAR(4000) = NULL,
    @Updated_By NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.DynamicSections
    SET Section_Type = @Section_Type,
        Title_Text = @Title_Text,
        Content_Text = @Content_Text,
        Display_Order = @Display_Order,
        IsActive = @IsActive,
        IsBold = @IsBold,
        IsItalic = @IsItalic,
        IsUnderline = @IsUnderline,
        Text_Align = @Text_Align,
        Font_Size = @Font_Size,
        Text_Color = @Text_Color,
        Margin_Top = @Margin_Top,
        Margin_Bottom = @Margin_Bottom,
        Padding_Top = @Padding_Top,
        Padding_Bottom = @Padding_Bottom,
        Custom_CSS_Class = @Custom_CSS_Class,
        Updated_At = GETDATE(),
        Updated_By = @Updated_By
    WHERE Section_Id = @Section_Id;

    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
