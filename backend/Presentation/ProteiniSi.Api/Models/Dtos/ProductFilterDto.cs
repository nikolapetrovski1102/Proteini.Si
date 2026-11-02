using System;
using System.Collections.Generic;

namespace ProteiniSi.Api.Models.DTOs
{
    public class ProductFilterDto
    {
        // Category filters
        public List<int> CategoryIds { get; set; } = new List<int>();

        // Sport filters
        public List<int> SportIds { get; set; } = new List<int>();

        // Goal filters
        public List<int> GoalIds { get; set; } = new List<int>();

        // Use timing filters
        public List<int> UseTimingIds { get; set; } = new List<int>();

        // Flavor filters
        public List<int> FlavorIds { get; set; } = new List<int>();

        // Brand filters
        public List<int> BrandIds { get; set; } = new List<int>();

        // Tag filters
        public List<int> TagIds { get; set; } = new List<int>();

        // Price range
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        // Product status
        public bool? InStock { get; set; }
        public bool? OnSale { get; set; }
        public bool? NewProducts { get; set; }
        public bool? Outlet { get; set; }
        public bool? JustForMe { get; set; }
        public bool? UpcomingPromotions { get; set; }
        public bool? GiftVouchers { get; set; }

        // Search
        public string? SearchTerm { get; set; }

        // Pagination
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;

        // Sorting
        public string SortBy { get; set; } = "Priority";
        public string SortOrder { get; set; } = "ASC";
    }

    public class ProductFilterResponseDto
    {
        public List<Product> Products { get; set; } = new List<Product>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
