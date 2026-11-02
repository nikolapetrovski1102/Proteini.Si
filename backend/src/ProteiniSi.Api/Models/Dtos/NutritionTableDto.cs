namespace NutritionApi.DTOs;

public class CreateTableDto
{
    public string TableName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<string> Columns { get; set; } = new List<string>();
    public List<TableRowDto> Rows { get; set; } = new List<TableRowDto>();
}

public class TableRowDto
{
    public string RowLabel { get; set; } = string.Empty;
    public List<string> Cells { get; set; } = new List<string>();
    public int? IndentLevel { get; set; }
}

public class PasteTableDto
{
    public string RawText { get; set; } = string.Empty;
    public string? TableName { get; set; }
}

public class UpdateTableDto
{
    public string? TableName { get; set; }
    public string? Description { get; set; }
    public List<string>? Columns { get; set; }
    public List<TableRowDto>? Rows { get; set; }
}