namespace ProteiniSi.Models;

public class ProductSearchQuery
{
    public string? SearchTerm { get; set; }
    public string? SearchTermExact { get; set; }
    public int? BrandId { get; set; }
    public int? FlavorId { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool NewInTheShop { get; set; }
    public bool ProductsOnSale { get; set; }
    public bool ProductsInTheOutlet { get; set; }
    public string SortBy { get; set; } = "createdat";
    public bool SortDesc { get; set; }
    public int Offset { get; set; }
    public int PageSize { get; set; }
}

public class ProductFilterQuery
{
    public List<int> CategoryIds { get; set; } = [];
    public List<int> SportIds { get; set; } = [];
    public List<int> GoalIds { get; set; } = [];
    public List<int> UseTimingIds { get; set; } = [];
    public List<int> TagIds { get; set; } = [];
    public List<int> BrandIds { get; set; } = [];
    public List<int> FlavorIds { get; set; } = [];
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool InStock { get; set; }
    public bool OnSale { get; set; }
    public bool UpcomingPromotions { get; set; }
    public bool NewProducts { get; set; }
    public bool Outlet { get; set; }
    public bool GiftVouchers { get; set; }
    public bool JustForMe { get; set; }
    public bool HasSearch { get; set; }
    public List<string> SearchTerms { get; set; } = [];
    public string? SearchExact { get; set; }
    public string? SearchPrefix { get; set; }
    public string? SearchContains { get; set; }
    public string SortBy { get; set; } = "priority";
    public bool SortDesc { get; set; }
    public int Offset { get; set; }
    public int PageSize { get; set; }
}
