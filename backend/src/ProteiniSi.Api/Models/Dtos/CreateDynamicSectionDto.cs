namespace ProteiniSi.Api.Models.DTOs
{
    public class CreateDynamicSectionDto
    {
        public string Page_Type { get; set; } // 'terms-of-service', 'general-provisions'
        public string Section_Type { get; set; } // 'title', 'subtitle', 'paragraph', 'award', 'spacer'
        public string Title_Text { get; set; }
        public string Content_Text { get; set; }
        public int Display_Order { get; set; }
        public bool IsActive { get; set; } = true;

        // Styling options
        public bool IsBold { get; set; }
        public bool IsItalic { get; set; }
        public bool IsUnderline { get; set; }
        public string Text_Align { get; set; } = "left";
        public string Font_Size { get; set; }
        public string Text_Color { get; set; }
        public int? Margin_Top { get; set; }
        public int? Margin_Bottom { get; set; }
        public int? Padding_Top { get; set; }
        public int? Padding_Bottom { get; set; }
        public string Custom_CSS_Class { get; set; }
    }
}