namespace ProteinisiBackend.Models.DTOs
{
    public class UpdateDynamicSectionDto
    {
        public int Section_Id { get; set; }
        public string Section_Type { get; set; }
        public string Title_Text { get; set; }
        public string Content_Text { get; set; }
        public int Display_Order { get; set; }
        public bool IsActive { get; set; }

        // Styling options
        public bool IsBold { get; set; }
        public bool IsItalic { get; set; }
        public bool IsUnderline { get; set; }
        public string Text_Align { get; set; }
        public string Font_Size { get; set; }
        public string Text_Color { get; set; }
        public int? Margin_Top { get; set; }
        public int? Margin_Bottom { get; set; }
        public int? Padding_Top { get; set; }
        public int? Padding_Bottom { get; set; }
        public string Custom_CSS_Class { get; set; }
    }
}