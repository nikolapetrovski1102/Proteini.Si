namespace ProteiniSi.Dtos;

public class UpdateHomeShowcaseDto
{
    public string? TitleMk { get; set; }
    public string? TitleAl { get; set; }
    public string Source { get; set; } = "new";
    public int ItemCount { get; set; } = 3;
    public bool IsActive { get; set; } = true;
    /// <summary>Hand-picked products in display order (used when Source is "manual").</summary>
    public List<int> ProductIds { get; set; } = [];
}
