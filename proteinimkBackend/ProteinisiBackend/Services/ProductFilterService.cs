using Dapper;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models;
using ProteinisiBackend.Models.DTOs;
using System.Text;

namespace ProteinisiBackend.Services
{
    public class ProductFilterService
    {
        private readonly DataContextDapper _dapper;

        public ProductFilterService(DataContextDapper dapper)
        {
            _dapper = dapper;
        }

        public ProductFilterResponseDto GetFilteredProducts(ProductFilterDto filters)
        {
            // SAFETY: Set default values for invalid inputs
            if (filters.Page < 1) filters.Page = 1;
            if (filters.PageSize < 1) filters.PageSize = 20;
            if (filters.PageSize > 100) filters.PageSize = 100;

            // SAFETY: Fix sort parameters
            if (string.IsNullOrWhiteSpace(filters.SortBy) || filters.SortBy == "string")
                filters.SortBy = "Priority";
            if (string.IsNullOrWhiteSpace(filters.SortOrder) || filters.SortOrder == "string")
                filters.SortOrder = "ASC";
            filters.SortOrder = filters.SortOrder.ToUpper() == "DESC" ? "DESC" : "ASC";

            // SAFETY: Remove invalid IDs and duplicate filter values before building SQL.
            filters.CategoryIds = NormalizeFilterIds(filters.CategoryIds);
            filters.SportIds = NormalizeFilterIds(filters.SportIds);
            filters.GoalIds = NormalizeFilterIds(filters.GoalIds);
            filters.UseTimingIds = NormalizeFilterIds(filters.UseTimingIds);
            filters.FlavorIds = NormalizeFilterIds(filters.FlavorIds);
            filters.BrandIds = NormalizeFilterIds(filters.BrandIds);
            filters.TagIds = NormalizeFilterIds(filters.TagIds);

            // Build the WHERE clause and parameters
            var whereClause = "";
            var parameters = new DynamicParameters();
            var conditions = new List<string>();

            // Category filters: parent category selections must include all descendants.
            if (filters.CategoryIds.Any())
            {
                // If both an ancestor and one of its descendants are selected,
                // keep only the more specific descendant. Otherwise a request
                // such as "Proteins + Vegan Protein" becomes an OR match and
                // returns every protein product.
                var effectiveCategoryIds = RemoveAncestorCategorySelections(filters.CategoryIds);
                var finalCategoryIds = new List<int>();

                foreach (var catId in effectiveCategoryIds)
                {
                    string checkParentSql = "SELECT COUNT(1) FROM ProductCategories WHERE Parent_Category_Id = @CategoryId";
                    var hasChildren = _dapper.LoadDataSingle<int>(checkParentSql, new { CategoryId = catId }) > 0;

                    if (hasChildren)
                    {
                        finalCategoryIds.AddRange(GetCategoryAndChildrenIdsForParent(_dapper, catId));
                        continue;
                    }

                    finalCategoryIds.Add(catId);
                }

                finalCategoryIds = finalCategoryIds.Distinct().ToList();

                if (finalCategoryIds.Any())
                {
                    conditions.Add("EXISTS (SELECT 1 FROM ProductCategoryMapping pcm WHERE pcm.Product_Id = p.Product_Id AND pcm.Category_Id IN @CategoryIds)");
                    parameters.Add("@CategoryIds", finalCategoryIds);

                    Console.WriteLine($"Category filter - Original IDs: {string.Join(",", filters.CategoryIds)}");
                    Console.WriteLine($"Category filter - Effective IDs: {string.Join(",", effectiveCategoryIds)}");
                    Console.WriteLine($"Category filter - Final IDs: {string.Join(",", finalCategoryIds)}");
                }
            }

            // Sport filters
            if (filters.SportIds.Any())
            {
                conditions.Add("EXISTS (SELECT 1 FROM ProductSportMapping psm WHERE psm.Product_Id = p.Product_Id AND psm.Sport_Id IN @SportIds)");
                parameters.Add("@SportIds", filters.SportIds);
            }

            // Goal filters
            if (filters.GoalIds.Any())
            {
                conditions.Add("EXISTS (SELECT 1 FROM ProductGoalMapping pgm WHERE pgm.Product_Id = p.Product_Id AND pgm.Goal_Id IN @GoalIds)");
                parameters.Add("@GoalIds", filters.GoalIds);
            }

            // Use timing filters
            if (filters.UseTimingIds.Any())
            {
                conditions.Add("EXISTS (SELECT 1 FROM ProductUseTimingMapping putm WHERE putm.Product_Id = p.Product_Id AND putm.UseTiming_Id IN @UseTimingIds)");
                parameters.Add("@UseTimingIds", filters.UseTimingIds);
            }

            // Tag filters
            if (filters.TagIds.Any())
            {
                conditions.Add("EXISTS (SELECT 1 FROM ProductTagMapping ptm WHERE ptm.Product_Id = p.Product_Id AND ptm.Tag_Id IN @TagIds)");
                parameters.Add("@TagIds", filters.TagIds);
            }

            // Brand filters
            if (filters.BrandIds.Any())
            {
                conditions.Add("p.Brand_Id IN @BrandIds");
                parameters.Add("@BrandIds", filters.BrandIds);
            }

            // Flavor filters
            if (filters.FlavorIds.Any())
            {
                conditions.Add("(p.Flavor_Id IN @FlavorIds OR v.Flavor_Id IN @FlavorIds)");
                parameters.Add("@FlavorIds", filters.FlavorIds);
            }

            // Price range
            if (filters.MinPrice.HasValue && filters.MinPrice.Value > 0)
            {
                conditions.Add("COALESCE(v.Price, p.Price) >= @MinPrice");
                parameters.Add("@MinPrice", filters.MinPrice.Value);
            }

            if (filters.MaxPrice.HasValue && filters.MaxPrice.Value > 0)
            {
                conditions.Add("COALESCE(v.Price, p.Price) <= @MaxPrice");
                parameters.Add("@MaxPrice", filters.MaxPrice.Value);
            }

            // Product status filters
            if (filters.InStock == true)
            {
                conditions.Add("((ISNULL(p.HasVariants, 0) = 1 AND v.Quantity > 0) OR (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0))");
            }

            if (filters.OnSale == true)
            {
                conditions.Add("p.ProductsOnSale = 1 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))");
            }

            if (filters.UpcomingPromotions == true)
            {
                conditions.Add("p.UpcomingPromotion = 1");
            }

            if (filters.NewProducts == true)
            {
                conditions.Add("p.NewInTheShop = 1");
            }

            if (filters.Outlet == true)
            {
                conditions.Add("p.ProductsInTheOutlet = 1");
            }

            if (filters.GiftVouchers == true)
            {
                conditions.Add("p.IsGiftVoucher = 1");
            }

            if (filters.JustForMe == true)
            {
                conditions.Add("p.JustForMe = 1");
                conditions.Add("((ISNULL(p.HasVariants, 0) = 1 AND v.Quantity > 0) OR (ISNULL(p.HasVariants, 0) = 0 AND p.Quantity > 0))");
            }

            // Search term
            var searchRankExpression = "99";
            if (!string.IsNullOrEmpty(filters.SearchTerm) && filters.SearchTerm != "string")
            {
                var searchTerms = SearchTermExpander.Expand(filters.SearchTerm);
                var termConditions = new List<string>();

                for (var index = 0; index < searchTerms.Count; index++)
                {
                    var parameterName = $"@SearchTerm{index}";
                    termConditions.Add($@"(
                        p.Name LIKE {parameterName}
                        OR p.NameAl LIKE {parameterName}
                        OR b.Brand_Name LIKE {parameterName}
                        OR f.Flavor_Name LIKE {parameterName}
                        OR v.Flavor_Name LIKE {parameterName}
                        OR v.Packaging_Name LIKE {parameterName}
                        OR v.Variant_Name LIKE {parameterName}
                        OR EXISTS (
                            SELECT 1
                            FROM ProductVariants searchVariant
                            WHERE searchVariant.Product_Id = p.Product_Id
                              AND searchVariant.IsActive = 1
                              AND (searchVariant.Flavor_Name LIKE {parameterName}
                                   OR searchVariant.Packaging_Name LIKE {parameterName}
                                   OR searchVariant.Variant_Name LIKE {parameterName}
                                   OR searchVariant.SKU LIKE {parameterName})
                        )
                        OR EXISTS (
                            SELECT 1
                            FROM ProductCategoryMapping searchPcm
                            INNER JOIN ProductCategories searchCategory
                                ON searchCategory.Category_Id = searchPcm.Category_Id
                            WHERE searchPcm.Product_Id = p.Product_Id
                              AND (searchCategory.Category_Name LIKE {parameterName}
                                   OR searchCategory.Category_Slug LIKE {parameterName})
                        )
                    )");
                    parameters.Add(parameterName, $"%{searchTerms[index]}%");
                }

                conditions.Add("(" + string.Join(" OR ", termConditions) + ")");
                parameters.Add("@SearchExact", filters.SearchTerm.Trim());
                parameters.Add("@SearchPrefix", filters.SearchTerm.Trim() + "%");
                parameters.Add("@SearchContains", "%" + filters.SearchTerm.Trim() + "%");
                searchRankExpression = @"CASE
                    WHEN p.Name = @SearchExact OR p.NameAl = @SearchExact THEN 0
                    WHEN p.Name LIKE @SearchPrefix OR p.NameAl LIKE @SearchPrefix THEN 1
                    WHEN p.Name LIKE @SearchContains OR p.NameAl LIKE @SearchContains THEN 2
                    WHEN b.Brand_Name LIKE @SearchContains THEN 3
                    ELSE 4
                END";
            }

            // Build WHERE clause
            if (conditions.Any())
            {
                whereClause = "WHERE " + string.Join(" AND ", conditions);
            }

            const string variantsCte = @"
        WITH RankedVariants AS (
            SELECT
                pv.*,
                ROW_NUMBER() OVER (
                    PARTITION BY pv.Product_Id,
                        COALESCE(
                            CONVERT(nvarchar(50), pv.Packaging_Id),
                            NULLIF(LOWER(LTRIM(RTRIM(pv.Packaging_Name))), ''),
                            CONCAT('variant-', pv.Variant_Id)
                        )
                    ORDER BY
                        CASE WHEN pv.IsDefault = 1 THEN 0 ELSE 1 END,
                        CASE WHEN pv.Quantity > 0 THEN 0 ELSE 1 END,
                        pv.Display_Order,
                        pv.Variant_Id
                ) AS PackagingRow
            FROM ProductVariants pv
            WHERE pv.IsActive = 1
        )";

            // Build the main query. Products with variants intentionally yield
            // one row per packaging; products without variants yield one row.
            string mainQuery = $@"
        {variantsCte}
        SELECT 
            p.Product_Id,
            p.Name,
            COALESCE(v.Variant_Image_Path, p.Img) AS Img,
            p.Category,
            CASE WHEN p.HasVariants = 1 THEN COALESCE(v.Quantity, 0) ELSE p.Quantity END AS Quantity,
            p.Servings,
            p.GPerServing, p.GNutrition, p.MainDescriptions, 
            p.OtherDescriptionTitle, p.OtherDescriptionText, p.NutritionValuesIngredients,
            p.NutritionValuesIngredientsDescription, p.NutritionInformation,
            p.InstructionsForUse, p.InstructionsForUseDescription, p.InstructionsOnHowToUseIt,
            p.CreatedAt, p.UpdatedAt, p.NewInTheShop, p.ProductsOnSale, p.SalePrice, p.SaleEndDate,
            CASE
                WHEN p.ProductsOnSale = 1
                 AND (p.SaleEndDate IS NULL OR p.SaleEndDate >= CAST(GETDATE() AS date))
                 AND COALESCE(v.Compare_Price, p.SalePrice) > 0
                 AND COALESCE(v.Compare_Price, p.SalePrice) < COALESCE(v.Price, p.Price)
                    THEN COALESCE(v.Compare_Price, p.SalePrice)
                ELSE NULL
            END AS Compare_Price,
            p.UpcomingPromotion,
            p.ShortExpiry, p.ExpiryDate, p.IsGiftVoucher, p.VoucherMinAmount, p.VoucherMaxAmount, p.NameAl,
            p.RecommendedForYou, p.ProductsInTheOutlet, p.JustForMe,
            COALESCE(v.Price, p.Price) AS Price,
            p.HasVariants,
            p.Brand_Id, p.Flavor_Id,
            b.Brand_Name as BrandName,
            COALESCE(v.Flavor_Name, f.Flavor_Name) as FlavorName,
            p.Product_Id AS Parent_Product_Id,
            v.Variant_Id,
            CASE WHEN v.Variant_Id IS NULL THEN 0 ELSE 1 END AS IsVariant,
            v.Packaging_Name AS VariantPackagingName,
            v.Flavor_Name AS VariantFlavorName,
            CASE WHEN p.HasVariants = 1 THEN (
                SELECT COUNT(*)
                FROM (
                    SELECT DISTINCT COALESCE(
                        CONVERT(nvarchar(50), packaging.Packaging_Id),
                        NULLIF(LOWER(LTRIM(RTRIM(packaging.Packaging_Name))), ''),
                        CONCAT('variant-', packaging.Variant_Id)
                    ) AS PackagingKey
                    FROM ProductVariants packaging
                    WHERE packaging.Product_Id = p.Product_Id AND packaging.IsActive = 1
                ) packagingGroups
            ) ELSE 1 END AS PackagingCount,
            CASE WHEN p.HasVariants = 1 THEN (
                SELECT COUNT(DISTINCT COALESCE(
                    CONVERT(nvarchar(50), taste.Flavor_Id),
                    NULLIF(LOWER(LTRIM(RTRIM(taste.Flavor_Name))), '')
                ))
                FROM ProductVariants taste
                WHERE taste.Product_Id = p.Product_Id AND taste.IsActive = 1
            ) ELSE CASE WHEN p.Flavor_Id IS NULL THEN 0 ELSE 1 END END AS FlavorCount,
            {searchRankExpression} AS SearchRank
        FROM Products p
        LEFT JOIN RankedVariants v
            ON v.Product_Id = p.Product_Id AND v.PackagingRow = 1
        LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
        LEFT JOIN Flavors f ON p.Flavor_Id = f.Flavor_Id
        WHERE (ISNULL(p.HasVariants, 0) = 0 OR v.Variant_Id IS NOT NULL)
        {(whereClause.Length > 0 ? "AND " + whereClause.Substring(6) : string.Empty)}
    ";

            // Get total count
            string countQuery = $@"
        {variantsCte}
        SELECT COUNT(*) 
        FROM Products p
        LEFT JOIN RankedVariants v
            ON v.Product_Id = p.Product_Id AND v.PackagingRow = 1
        LEFT JOIN Brands b ON p.Brand_Id = b.Brand_Id
        LEFT JOIN Flavors f ON p.Flavor_Id = f.Flavor_Id
        WHERE (ISNULL(p.HasVariants, 0) = 0 OR v.Variant_Id IS NOT NULL)
        {(whereClause.Length > 0 ? "AND " + whereClause.Substring(6) : string.Empty)}
    ";

            var totalCount = _dapper.LoadDataSingle<int>(countQuery, parameters);

            // Add sorting and pagination
            string pagedQuery = $@"
        {mainQuery}
        ORDER BY {(filters.SearchTerm is not null && filters.SearchTerm != "string" ? "SearchRank ASC, " : string.Empty)}{GetSortColumn(filters.SortBy)} {filters.SortOrder}, p.Product_Id ASC, v.Variant_Id ASC
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY
    ";

            parameters.Add("@Offset", (filters.Page - 1) * filters.PageSize);
            parameters.Add("@PageSize", filters.PageSize);

            // Log for debugging
            Console.WriteLine($"SQL Query: {pagedQuery}");
            Console.WriteLine($"Total Count Query: {countQuery}");
            Console.WriteLine($"Offset: {(filters.Page - 1) * filters.PageSize}, PageSize: {filters.PageSize}");

            var products = _dapper.LoadData<Product>(pagedQuery, parameters).ToList();

            return new ProductFilterResponseDto
            {
                Products = products,
                TotalCount = totalCount,
                Page = filters.Page,
                PageSize = filters.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / filters.PageSize)
            };
        }

        private string GetSortColumn(string sortBy)
        {
            return sortBy?.ToLower() switch
            {
                "price" => "COALESCE(v.Price, p.Price)",
                "name" => "p.Name",
                "createdat" => "p.CreatedAt",
                "product_id" => "p.Product_Id",
                "priority" => GetPrioritySortExpression(),
                _ => GetPrioritySortExpression()
            };
        }

        private static string GetPrioritySortExpression() => @"CASE
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%battery%' THEN 0
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%sportnahrung%' THEN 0
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%proteini.si%'
              OR LOWER(COALESCE(b.Brand_Name, '')) LIKE '%proteini si%' THEN 1
            WHEN LOWER(COALESCE(b.Brand_Name, '')) = 'usn' THEN 2
            WHEN LOWER(COALESCE(b.Brand_Name, '')) LIKE '%olimp%' THEN 3
            WHEN EXISTS (
                SELECT 1 FROM ProductCategoryMapping priorityPcm
                INNER JOIN ProductCategories priorityCategory
                    ON priorityCategory.Category_Id = priorityPcm.Category_Id
                WHERE priorityPcm.Product_Id = p.Product_Id
                  AND (LOWER(priorityCategory.Category_Name) LIKE '%whey%'
                       OR LOWER(priorityCategory.Category_Name) LIKE '%protein powder%')
            ) THEN 4
            WHEN EXISTS (
                SELECT 1 FROM ProductCategoryMapping priorityPcm
                INNER JOIN ProductCategories priorityCategory
                    ON priorityCategory.Category_Id = priorityPcm.Category_Id
                WHERE priorityPcm.Product_Id = p.Product_Id
                  AND LOWER(priorityCategory.Category_Name) LIKE '%bar%'
            ) THEN 5
            ELSE 6
        END";

        private static List<int> NormalizeFilterIds(IEnumerable<int>? ids)
        {
            return ids?
                .Where(id => id > 0)
                .Distinct()
                .ToList() ?? new List<int>();
        }

        private List<int> RemoveAncestorCategorySelections(IReadOnlyCollection<int> categoryIds)
        {
            if (categoryIds.Count < 2)
                return categoryIds.ToList();

            var parentByCategoryId = _dapper
                .LoadData<ProductCategory>("SELECT Category_Id, Parent_Category_Id FROM ProductCategories")
                .ToDictionary(category => category.Category_Id, category => category.Parent_Category_Id);

            return categoryIds
                .Where(candidateAncestor => !categoryIds.Any(categoryId =>
                    categoryId != candidateAncestor &&
                    IsDescendantOf(categoryId, candidateAncestor, parentByCategoryId)))
                .ToList();
        }

        private static bool IsDescendantOf(
            int categoryId,
            int possibleAncestorId,
            IReadOnlyDictionary<int, int?> parentByCategoryId)
        {
            var visited = new HashSet<int>();
            var currentId = categoryId;

            while (parentByCategoryId.TryGetValue(currentId, out var parentId) && parentId.HasValue)
            {
                if (!visited.Add(currentId))
                    return false;

                if (parentId.Value == possibleAncestorId)
                    return true;

                currentId = parentId.Value;
            }

            return false;
        }

        // Helper method to get all available filters for UI
        public FilterOptionsDto GetFilterOptions()
        {
            var filters = new FilterOptionsDto();

            // Get all categories (flat list for UI, frontend can show hierarchy)
            filters.Categories = _dapper.LoadData<ProductCategory>("SELECT * FROM ProductCategories ORDER BY Category_Level, Display_Order").ToList();
            filters.Sports = _dapper.LoadData<Sport>("SELECT * FROM Sports ORDER BY Display_Order").ToList();
            filters.Goals = _dapper.LoadData<Goal>("SELECT * FROM Goals ORDER BY Display_Order").ToList();
            filters.UseTimings = _dapper.LoadData<UseTiming>("SELECT * FROM UseTimings ORDER BY Display_Order").ToList();
            filters.Flavors = _dapper.LoadData<Flavor>("SELECT * FROM Flavors ORDER BY Display_Order").ToList();
            filters.Brands = _dapper.LoadData<Brand>("SELECT * FROM Brands ORDER BY Display_Order").ToList();
            filters.Tags = _dapper.LoadData<ProductTag>("SELECT * FROM ProductTags ORDER BY Display_Order").ToList();

            return filters;
        }

        // Helper method to get all child category IDs for a SINGLE parent (including the parent itself)
        private List<int> GetCategoryAndChildrenIdsForParent(DataContextDapper _dapper, int parentId)
        {
            var allCategoryIds = new List<int>();
            var queue = new Queue<int>();
            queue.Enqueue(parentId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                if (!allCategoryIds.Contains(currentId))
                {
                    allCategoryIds.Add(currentId);
                }

                // Get all direct children of this category
                string childSql = "SELECT Category_Id FROM ProductCategories WHERE Parent_Category_Id = @ParentId";
                var children = _dapper.LoadData<int>(childSql, new { ParentId = currentId }).ToList();

                foreach (var childId in children)
                {
                    if (!allCategoryIds.Contains(childId) && !queue.Contains(childId))
                    {
                        queue.Enqueue(childId);
                    }
                }
            }

            return allCategoryIds.Distinct().ToList();
        }
    }

    public class FilterOptionsDto
    {
        public List<ProductCategory> Categories { get; set; }
        public List<Sport> Sports { get; set; }
        public List<Goal> Goals { get; set; }
        public List<UseTiming> UseTimings { get; set; }
        public List<Flavor> Flavors { get; set; }
        public List<Brand> Brands { get; set; }
        public List<ProductTag> Tags { get; set; }
    }
}
