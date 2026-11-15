namespace ProteiniSi.Models;

public class RelatedProduct
{
    public int Product_Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Img { get; set; }
    public decimal Price { get; set; }
    public string Slug { get; set; } = string.Empty;
    public int OrderCount { get; set; }

    /// <summary>Why it is recommended: "together" (bought with / goes with the product) or "similar" (an alternative).</summary>
    public string Reason { get; set; } = string.Empty;
}
