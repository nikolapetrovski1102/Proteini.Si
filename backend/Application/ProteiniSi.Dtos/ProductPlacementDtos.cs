namespace ProteiniSi.Dtos;

public class SaveProductPlacementsDto
{
    /// <summary>all, category or brand.</summary>
    public string Scope { get; set; } = "all";
    /// <summary>Category or brand id; 0 for the whole shop.</summary>
    public int TargetId { get; set; }
    /// <summary>Pinned products in display order; empty clears the listing's pins.</summary>
    public List<int> ProductIds { get; set; } = [];
}
