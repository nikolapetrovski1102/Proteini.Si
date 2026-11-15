namespace ProteiniSi.Models;

/// <summary>One row of the home page "Because you ordered" section (dbo.usp_Product_GetForCustomer).</summary>
public class CustomerRecommendation
{
    public int Product_Id { get; set; }

    /// <summary>"anchor" (the latest ordered product), "reorder" (order again) or "similar" (you may also like).</summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>When the customer last ordered it (anchor and reorder rows only).</summary>
    public DateTime? OrderedAt { get; set; }

    public int Position { get; set; }
}
