SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_DynamicSection_GetAllByPage
    @PageType NVARCHAR(4000)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Section_Id, Page_Type, Section_Type, Title_Text, Content_Text, Display_Order, IsActive,
           IsBold, IsItalic, IsUnderline, Text_Align, Font_Size, Text_Color,
           Margin_Top, Margin_Bottom, Padding_Top, Padding_Bottom, Custom_CSS_Class, Created_At, Updated_At
    FROM dbo.DynamicSections
    WHERE Page_Type = @PageType
    ORDER BY Display_Order ASC;
END
GO
