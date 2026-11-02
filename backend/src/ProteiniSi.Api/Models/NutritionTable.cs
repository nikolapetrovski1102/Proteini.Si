using System.Text.Json.Serialization;

namespace NutritionApi.Models;

public class NutritionTable
{
    public int Id { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ColumnsJson { get; set; } = "[]";
    public string RowsJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }

    [JsonIgnore]
    public List<string> Columns
    {
        get => System.Text.Json.JsonSerializer.Deserialize<List<string>>(ColumnsJson) ?? new List<string>();
        set => ColumnsJson = System.Text.Json.JsonSerializer.Serialize(value);
    }

    [JsonIgnore]
    public List<TableRow> Rows
    {
        get => System.Text.Json.JsonSerializer.Deserialize<List<TableRow>>(RowsJson) ?? new List<TableRow>();
        set => RowsJson = System.Text.Json.JsonSerializer.Serialize(value);
    }
}

public class TableRow
{
    public string RowLabel { get; set; } = string.Empty;
    public List<string> Cells { get; set; } = new List<string>();
    public int? IndentLevel { get; set; } // For sub-rows (0 = no indent, 1,2,3...)
}