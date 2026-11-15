namespace ProteiniSi.Models;

/// <summary>A product pinned to the top of a shop listing: a category, a brand, or the whole shop.</summary>
public class ProductPlacement
{
    public const string ScopeAll = "all";
    public const string ScopeCategory = "category";
    public const string ScopeBrand = "brand";
    public static readonly string[] Scopes = [ScopeAll, ScopeCategory, ScopeBrand];

    public string Scope { get; set; } = ScopeAll;
    /// <summary>Category or brand id; 0 for the whole shop.</summary>
    public int Target_Id { get; set; }
    public int Product_Id { get; set; }
    public int Position { get; set; }
}

/// <summary>A product the admin can pin, with what the picker filters on.</summary>
public class ProductPlacementCandidate
{
    public int Product_Id { get; set; }
    public string? Name { get; set; }
    public string? Img { get; set; }
    public int? Brand_Id { get; set; }
    public int Quantity { get; set; }
    public List<int> CategoryIds { get; set; } = [];
}

public class ProductPlacementAdmin
{
    public List<ProductPlacement> Placements { get; set; } = [];
    public List<ProductPlacementCandidate> Products { get; set; } = [];
}
