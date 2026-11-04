SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_DynamicSection_Create
    @Page_Type NVARCHAR(4000),
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
    @Created_By NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    INSERT INTO dbo.DynamicSections (
        Page_Type, Section_Type, Title_Text, Content_Text, Display_Order, IsActive,
        IsBold, IsItalic, IsUnderline, Text_Align, Font_Size, Text_Color,
        Margin_Top, Margin_Bottom, Padding_Top, Padding_Bottom, Custom_CSS_Class,
        Created_At, Created_By
    ) VALUES (
        @Page_Type, @Section_Type, @Title_Text, @Content_Text, @Display_Order, @IsActive,
        @IsBold, @IsItalic, @IsUnderline, @Text_Align, @Font_Size, @Text_Color,
        @Margin_Top, @Margin_Bottom, @Padding_Top, @Padding_Bottom, @Custom_CSS_Class,
        GETDATE(), @Created_By
    );

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS Id;
END
GO
