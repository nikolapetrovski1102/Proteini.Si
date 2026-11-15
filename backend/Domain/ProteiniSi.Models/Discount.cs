namespace ProteiniSi.Models;

/**
 * Automatic discount (no code). Brand/category discounts list Target_Ids; product discounts list Items
 * (single variants). Discount_Type "percent" uses Percentage; "price" uses each item's New_Price.
 */
public class Discount
{
    public int Discount_Id { get; set; }
    public string Name { get; set; } = string.Empty;
    /** "percent" or "price". */
    public string Discount_Type { get; set; } = "percent";
    /** Null for "price" discounts. */
    public decimal? Percentage { get; set; }
    /** "products", "brands" or "categories". */
    public string Applies_To { get; set; } = "products";
    public DateTime? Starts_On { get; set; }
    public DateTime? Ends_On { get; set; }
    public bool Is_Active { get; set; }
    public DateTime Created_At { get; set; }
    public DateTime Updated_At { get; set; }
    /** Products the discount covers. */
    public int Product_Count { get; set; }
    /** Products currently showing this discount (a bigger discount on the same item wins). */
    public int Live_Count { get; set; }
    public List<int> Target_Ids { get; set; } = [];
    public List<DiscountItem> Items { get; set; } = [];
}

public class DiscountTarget
{
    public int Discount_Id { get; set; }
    public int Target_Id { get; set; }
}

/** One item of a product discount. Variant_Id 0 = a product without variants. */
public class DiscountItem
{
    public int Discount_Id { get; set; }
    public int Product_Id { get; set; }
    public int Variant_Id { get; set; }
    public decimal? New_Price { get; set; }
}

/** Something a product discount can pick: a variant (flavor + weight) or a product without variants. */
public class DiscountItemOption
{
    public int Product_Id { get; set; }
    public int Variant_Id { get; set; }
    public string Product_Name { get; set; } = string.Empty;
    public string? Brand_Name { get; set; }
    public string? Flavor_Name { get; set; }
    public string? Packaging_Name { get; set; }
    public decimal? Weight_Grams { get; set; }
    public decimal? Price { get; set; }
}
