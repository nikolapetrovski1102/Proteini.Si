namespace ProteiniSi.Dtos;

public class CreateDynamicSectionDto
{
    public string Page_Type { get; set; } = null!;
    public string Section_Type { get; set; } = null!;
    public string Title_Text { get; set; } = null!;
    public string Content_Text { get; set; } = null!;
    public int Display_Order { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsBold { get; set; }
    public bool IsItalic { get; set; }
    public bool IsUnderline { get; set; }
    public string Text_Align { get; set; } = "left";
    public string Font_Size { get; set; } = null!;
    public string Text_Color { get; set; } = null!;
    public int? Margin_Top { get; set; }
    public int? Margin_Bottom { get; set; }
    public int? Padding_Top { get; set; }
    public int? Padding_Bottom { get; set; }
    public string Custom_CSS_Class { get; set; } = null!;
}

public class UpdateDynamicSectionDto
{
    public int Section_Id { get; set; }
    public string Section_Type { get; set; } = null!;
    public string Title_Text { get; set; } = null!;
    public string Content_Text { get; set; } = null!;
    public int Display_Order { get; set; }
    public bool IsActive { get; set; }
    public bool IsBold { get; set; }
    public bool IsItalic { get; set; }
    public bool IsUnderline { get; set; }
    public string Text_Align { get; set; } = null!;
    public string Font_Size { get; set; } = null!;
    public string Text_Color { get; set; } = null!;
    public int? Margin_Top { get; set; }
    public int? Margin_Bottom { get; set; }
    public int? Padding_Top { get; set; }
    public int? Padding_Bottom { get; set; }
    public string Custom_CSS_Class { get; set; } = null!;
}

public class ReorderDynamicSectionsDto
{
    public List<SectionOrderDto> Sections { get; set; } = null!;
}

public class SectionOrderDto
{
    public int Section_Id { get; set; }
    public int Display_Order { get; set; }
}
