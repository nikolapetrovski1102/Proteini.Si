namespace ProteiniSi.Models;

/// <summary>Admin-managed home page product section ("Ново во продавница").</summary>
public class HomeShowcase
{
    public const string WhatsNewKey = "whats-new";
    public static readonly string[] Sources = ["new", "bestsellers", "sale", "manual"];

    public string Showcase_Key { get; set; } = WhatsNewKey;
    public string? Title_Mk { get; set; }
    public string? Title_Al { get; set; }
    /// <summary>new, bestsellers, sale, or manual (the hand-picked <see cref="ProductIds"/>).</summary>
    public string Source { get; set; } = "new";
    public int Item_Count { get; set; } = 3;
    public bool Is_Active { get; set; } = true;
    public DateTime? Updated_At { get; set; }
    public string? Updated_By { get; set; }
    public List<int> ProductIds { get; set; } = [];
}
