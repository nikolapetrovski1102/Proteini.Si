using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class ProductService(IProductProvider provider, IImageStorageService imageStorage) : IProductService
{
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private const string ProductImageFolder = "product-images";
    private const string GalleryImageFolder = "product-gallery";
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public async Task<ProductSearchResponseDto> SearchAsync(ProductSearchDto search)
    {
        var hasSearch = !string.IsNullOrWhiteSpace(search.SearchTerm);
        var sortBy = search.SortBy?.ToLower() switch
        {
            "price" => "price",
            "name" => "name",
            _ => "createdat"
        };

        var (totalCount, rows) = await provider.SearchAsync(new ProductSearchQuery
        {
            SearchTerm = hasSearch ? $"%{search.SearchTerm}%" : null,
            SearchTermExact = hasSearch ? search.SearchTerm.Trim() : null,
            BrandId = search.Brand_Id > 0 ? search.Brand_Id : null,
            FlavorId = search.Flavor_Id > 0 ? search.Flavor_Id : null,
            CategoryId = search.Category_Id > 0 ? search.Category_Id : null,
            MinPrice = search.MinPrice,
            MaxPrice = search.MaxPrice,
            NewInTheShop = search.NewInTheShop == true,
            ProductsOnSale = search.ProductsOnSale == true,
            ProductsInTheOutlet = search.ProductsInTheOutlet == true,
            SortBy = sortBy,
            SortDesc = string.Equals(search.SortOrder, "desc", StringComparison.OrdinalIgnoreCase),
            Offset = (search.Page - 1) * search.PageSize,
            PageSize = search.PageSize
        });

        var products = rows
            .GroupBy(product => product.Product_Id)
            .Select(group => group.First())
            .ToList();

        foreach (var product in products)
        {
            if (product.IsVariant)
            {
                if (product.Variant_Price.HasValue)
                    product.Price = product.Variant_Price.Value;

                if (product.Variant_Compare_Price is > 0)
                    product.Compare_Price = product.Variant_Compare_Price;
            }

            product.CategoriesList = string.IsNullOrEmpty(product.Categories)
                ? new List<string>()
                : product.Categories.Split(new[] { ", " }, StringSplitOptions.None).ToList();
        }

        return new ProductSearchResponseDto
        {
            Products = products,
            TotalCount = totalCount,
            CurrentPage = search.Page,
            PageSize = search.PageSize,
            TotalPages = totalCount > 0 ? (int)Math.Ceiling((double)totalCount / search.PageSize) : 0
        };
    }

    public Task<List<Product>> GetAllAsync() => provider.GetAllAsync();

    public async Task<ProductFilterOptionsDto> GetFilterOptionsAsync()
    {
        var (options, maximumPrice) = await provider.GetFilterOptionsAsync();

        options.PriceBounds = new PriceBoundsDto { Min = 0m, Max = Math.Max(1000m, maximumPrice) };
        options.PriceRanges =
        [
            new PriceRangeDto { Min = 0m, Max = 10m, Name = "Up to 10 MKD" },
            new PriceRangeDto { Min = 10m, Max = 25m, Name = "10 - 25 MKD" },
            new PriceRangeDto { Min = 25m, Max = 50m, Name = "25 - 50 MKD" },
            new PriceRangeDto { Min = 50m, Max = 100m, Name = "50 - 100 MKD" }
        ];

        return options;
    }

    public async Task<ProductFilterResponseDto> GetFilteredAsync(ProductFilterDto filters)
    {
        if (filters.Page < 1) filters.Page = 1;
        if (filters.PageSize < 1) filters.PageSize = 20;
        if (filters.PageSize > 100) filters.PageSize = 100;

        if (string.IsNullOrWhiteSpace(filters.SortBy) || filters.SortBy == "string")
            filters.SortBy = "Priority";
        if (string.IsNullOrWhiteSpace(filters.SortOrder) || filters.SortOrder == "string")
            filters.SortOrder = "ASC";
        filters.SortOrder = filters.SortOrder.ToUpper() == "DESC" ? "DESC" : "ASC";

        filters.CategoryIds = NormalizeFilterIds(filters.CategoryIds);
        filters.SportIds = NormalizeFilterIds(filters.SportIds);
        filters.GoalIds = NormalizeFilterIds(filters.GoalIds);
        filters.UseTimingIds = NormalizeFilterIds(filters.UseTimingIds);
        filters.FlavorIds = NormalizeFilterIds(filters.FlavorIds);
        filters.BrandIds = NormalizeFilterIds(filters.BrandIds);
        filters.TagIds = NormalizeFilterIds(filters.TagIds);

        var query = new ProductFilterQuery
        {
            CategoryIds = await ExpandCategoryIdsAsync(filters.CategoryIds),
            SportIds = filters.SportIds,
            GoalIds = filters.GoalIds,
            UseTimingIds = filters.UseTimingIds,
            TagIds = filters.TagIds,
            BrandIds = filters.BrandIds,
            FlavorIds = filters.FlavorIds,
            MinPrice = filters.MinPrice > 0 ? filters.MinPrice : null,
            MaxPrice = filters.MaxPrice > 0 ? filters.MaxPrice : null,
            InStock = filters.InStock == true,
            OnSale = filters.OnSale == true,
            UpcomingPromotions = filters.UpcomingPromotions == true,
            NewProducts = filters.NewProducts == true,
            Outlet = filters.Outlet == true,
            GiftVouchers = filters.GiftVouchers == true,
            JustForMe = filters.JustForMe == true,
            SortBy = filters.SortBy.ToLower() switch
            {
                "price" or "name" or "createdat" or "product_id" => filters.SortBy.ToLower(),
                _ => "priority"
            },
            SortDesc = filters.SortOrder == "DESC",
            Offset = (filters.Page - 1) * filters.PageSize,
            PageSize = filters.PageSize
        };

        if (!string.IsNullOrEmpty(filters.SearchTerm) && filters.SearchTerm != "string")
        {
            var term = filters.SearchTerm.Trim();
            query.HasSearch = true;
            query.SearchTerms = SearchTermExpander.Expand(filters.SearchTerm).Select(t => $"%{t}%").ToList();
            query.SearchExact = term;
            query.SearchPrefix = term + "%";
            query.SearchContains = "%" + term + "%";
        }

        var (totalCount, products) = await provider.FilterAsync(query);

        return new ProductFilterResponseDto
        {
            Products = products,
            TotalCount = totalCount,
            Page = filters.Page,
            PageSize = filters.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / filters.PageSize)
        };
    }

    public Task<ProductDetailsDto?> GetByIdAsync(int productId) => provider.GetByIdAsync(productId);

    public async Task<ProductSaveResultDto> CreateAsync(ProductCreateDto dto)
    {
        if (string.IsNullOrEmpty(dto.Name))
            throw new BadRequestException("Product name is required", new { error = "Product name is required" });

        var hasImage = dto.Image is { Length: > 0 };
        if (hasImage)
            EnsureValidImage(dto.Image!, asServerError: true);

        var mainDescriptions = new List<string>();
        if (!string.IsNullOrEmpty(dto.MainDescriptions))
        {
            try
            {
                var parsed = JsonConvert.DeserializeObject<List<string>>(dto.MainDescriptions);
                mainDescriptions = parsed != null && parsed.Any() ? parsed : new List<string> { dto.MainDescriptions };
            }
            catch
            {
                mainDescriptions = new List<string> { dto.MainDescriptions };
            }
        }

        var priceWithDDV = dto.Price;
        var priceWithoutDDV = Math.Round(priceWithDDV / (1 + dto.DDV_Percentage / 100m), 2);
        var ddvAmount = Math.Round(priceWithDDV - priceWithoutDDV, 2);

        var productId = await provider.CreateAsync(new ProductWrite
        {
            Name = dto.Name,
            Category = dto.Category,
            Quantity = dto.Quantity,
            Servings = dto.Servings,
            GPerServing = dto.GPerServing,
            GNutrition = dto.GNutrition,
            Price = priceWithDDV,
            DDV_Percentage = dto.DDV_Percentage,
            DDV_Amount = ddvAmount,
            Price_Without_DDV = priceWithoutDDV,
            Price_With_DDV = priceWithDDV,
            Brand_Id = dto.BrandId,
            Flavor_Id = dto.FlavorId,
            MainDescriptions = JsonConvert.SerializeObject(mainDescriptions),
            OtherDescriptionTitle = dto.OtherDescriptionTitle,
            OtherDescriptionText = dto.OtherDescriptionText,
            NutritionValuesIngredients = dto.NutritionValuesIngredients,
            NutritionValuesIngredientsDescription = dto.NutritionValuesIngredientsDescription,
            NutritionInformation = dto.NutritionInformation,
            InstructionsForUse = dto.InstructionsForUse,
            InstructionsForUseDescription = dto.InstructionsForUseDescription,
            InstructionsOnHowToUseIt = dto.InstructionsOnHowToUseIt,
            NewInTheShop = dto.NewInTheShop,
            ProductsOnSale = dto.ProductsOnSale,
            SalePrice = dto.ProductsOnSale && dto.SalePrice > 0 && dto.SalePrice < priceWithDDV ? dto.SalePrice : null,
            SaleEndDate = dto.ProductsOnSale ? dto.SaleEndDate : null,
            UpcomingPromotion = dto.UpcomingPromotion,
            ShortExpiry = dto.ShortExpiry,
            ExpiryDate = dto.ShortExpiry ? dto.ExpiryDate : null,
            IsGiftVoucher = dto.IsGiftVoucher,
            VoucherMinAmount = dto.IsGiftVoucher ? dto.VoucherMinAmount : null,
            VoucherMaxAmount = dto.IsGiftVoucher ? dto.VoucherMaxAmount : null,
            NameAl = dto.NameAl,
            DescriptionAl = dto.DescriptionAl,
            NutritionValuesIngredientsAl = dto.NutritionValuesIngredientsAl,
            NutritionValuesIngredientsDescriptionAl = dto.NutritionValuesIngredientsDescriptionAl,
            NutritionInformationAl = dto.NutritionInformationAl,
            InstructionsForUseAl = dto.InstructionsForUseAl,
            InstructionsForUseDescriptionAl = dto.InstructionsForUseDescriptionAl,
            InstructionsOnHowToUseItAl = dto.InstructionsOnHowToUseItAl,
            RecommendedForYou = dto.RecommendedForYou,
            ProductsInTheOutlet = dto.ProductsInTheOutlet,
            JustForMe = dto.JustForMe,
            LoyaltyPercentage = dto.LoyaltyPercentage ?? 2.0m,
            HasVariants = dto.HasVariants,
            Variant_Display_Type = dto.Variant_Display_Type,
            CategoryIds = ParseIdsLenient(dto.CategoryIds),
            SportIds = ParseIdsLenient(dto.SportIds),
            GoalIds = ParseIdsLenient(dto.GoalIds),
            UseTimingIds = ParseIdsLenient(dto.UseTimingIds),
            TagIds = ParseIdsLenient(dto.TagIds)
        });

        string? imagePath = null;
        if (hasImage)
        {
            imagePath = await SaveImageAsync(dto.Image!, ProductImageFolder, "product", productId);
            await provider.SetImageAsync(productId, imagePath, touchUpdatedAt: false);
        }

        return new ProductSaveResultDto
        {
            ProductId = productId,
            ImagePath = imagePath,
            PriceWithoutDDV = priceWithoutDDV,
            PriceWithDDV = priceWithDDV,
            DDVAmount = ddvAmount
        };
    }

    public async Task<ProductSaveResultDto?> UpdateAsync(int productId, string productData, IFormFile? image, string? removeImage)
    {
        var dto = JsonConvert.DeserializeObject<ProductEditDto>(productData)
            ?? throw new BadRequestException("Invalid product data", new { error = "Invalid product data" });

        decimal priceWithoutDDV;
        decimal ddvAmount;
        decimal priceWithDDV;

        if (dto.IsPriceWithDDV)
        {
            priceWithDDV = dto.Price;
            priceWithoutDDV = dto.Price / (1 + (dto.DDV_Percentage / 100m));
            ddvAmount = priceWithDDV - priceWithoutDDV;
        }
        else
        {
            priceWithoutDDV = dto.Price;
            ddvAmount = priceWithoutDDV * dto.DDV_Percentage / 100m;
            priceWithDDV = priceWithoutDDV + ddvAmount;
        }

        var categoryIds = ParseIds(dto.CategoryIds);
        var sportIds = ParseIds(dto.SportIds);
        var goalIds = ParseIds(dto.GoalIds);
        var useTimingIds = ParseIds(dto.UseTimingIds);
        var tagIds = ParseIds(dto.TagIds);

        var mainDescriptions = "[]";
        if (!string.IsNullOrEmpty(dto.MainDescription))
        {
            mainDescriptions = dto.MainDescription.Trim().StartsWith("[")
                ? dto.MainDescription
                : JsonConvert.SerializeObject(new List<string> { dto.MainDescription });
        }

        var replaceImage = false;
        string? newImage = null;

        if (removeImage == "true")
        {
            replaceImage = true;
        }
        else if (image is { Length: > 0 })
        {
            EnsureValidImage(image, asServerError: true);
            newImage = await SaveImageAsync(image, ProductImageFolder, "product", productId);
            replaceImage = true;
        }

        ProductImageChange? change;
        try
        {
            change = await provider.UpdateAsync(productId, new ProductWrite
            {
                Name = dto.Name ?? string.Empty,
                Category = dto.Category,
                Quantity = dto.Quantity,
                Servings = dto.Servings,
                GPerServing = dto.GPerServing,
                GNutrition = dto.GNutrition,
                Price = priceWithoutDDV,
                DDV_Percentage = dto.DDV_Percentage,
                DDV_Amount = ddvAmount,
                Price_Without_DDV = priceWithoutDDV,
                Price_With_DDV = priceWithDDV,
                Brand_Id = dto.BrandId,
                Flavor_Id = dto.FlavorId,
                MainDescriptions = mainDescriptions,
                OtherDescriptionTitle = dto.OtherDescriptionTitle,
                OtherDescriptionText = dto.OtherDescriptionText,
                NutritionValuesIngredients = dto.NutritionValuesIngredients,
                NutritionValuesIngredientsDescription = dto.NutritionValuesIngredientsDesc,
                NutritionInformation = dto.NutritionInformation,
                InstructionsForUse = dto.InstructionsForUse,
                InstructionsForUseDescription = dto.InstructionsForUseDesc,
                InstructionsOnHowToUseIt = dto.InstructionsOnHowToUseIt,
                NewInTheShop = dto.NewInTheShop,
                ProductsOnSale = dto.ProductsOnSale,
                SalePrice = dto.ProductsOnSale && dto.SalePrice > 0 && dto.SalePrice < dto.Price ? dto.SalePrice : null,
                SaleEndDate = dto.ProductsOnSale ? dto.SaleEndDate : null,
                UpcomingPromotion = dto.UpcomingPromotion,
                ShortExpiry = dto.ShortExpiry,
                ExpiryDate = dto.ShortExpiry ? dto.ExpiryDate : null,
                IsGiftVoucher = dto.IsGiftVoucher,
                VoucherMinAmount = dto.IsGiftVoucher ? dto.VoucherMinAmount : null,
                VoucherMaxAmount = dto.IsGiftVoucher ? dto.VoucherMaxAmount : null,
                NameAl = dto.NameAl,
                DescriptionAl = dto.DescriptionAl,
                NutritionValuesIngredientsAl = dto.NutritionValuesIngredientsAl,
                NutritionValuesIngredientsDescriptionAl = dto.NutritionValuesIngredientsDescriptionAl,
                NutritionInformationAl = dto.NutritionInformationAl,
                InstructionsForUseAl = dto.InstructionsForUseAl,
                InstructionsForUseDescriptionAl = dto.InstructionsForUseDescriptionAl,
                InstructionsOnHowToUseItAl = dto.InstructionsOnHowToUseItAl,
                RecommendedForYou = dto.RecommendedForYou,
                ProductsInTheOutlet = dto.ProductsInTheOutlet,
                JustForMe = dto.JustForMe,
                LoyaltyPercentage = dto.LoyaltyPercentage ?? 2.0m,
                CategoryIds = categoryIds,
                SportIds = sportIds,
                GoalIds = goalIds,
                UseTimingIds = useTimingIds,
                TagIds = tagIds
            }, replaceImage, newImage);
        }
        catch
        {
            imageStorage.Delete(newImage);
            throw;
        }

        if (change == null)
        {
            imageStorage.Delete(newImage);
            return null;
        }

        if (replaceImage)
            DeleteReplacedImage(change);

        return new ProductSaveResultDto
        {
            ProductId = productId,
            ImagePath = change.NewImg,
            PriceWithoutDDV = priceWithoutDDV,
            PriceWithDDV = priceWithDDV,
            DDVAmount = ddvAmount
        };
    }

    public async Task<bool> DeleteAsync(int productId)
    {
        var deleted = await provider.DeleteAsync(productId);
        if (deleted == null)
            return false;

        imageStorage.Delete(deleted.OldImg);
        return true;
    }

    public async Task<string> UploadImageAsync(int productId, IFormFile file)
    {
        EnsureValidImage(file, asServerError: false);

        if (!await provider.ExistsAsync(productId))
            throw new NotFoundException("Product not found", new { error = "Product not found" });

        var imagePath = await SaveImageAsync(file, ProductImageFolder, "product", productId);

        var change = await provider.SetImageAsync(productId, imagePath, touchUpdatedAt: true);
        if (change == null)
        {
            imageStorage.Delete(imagePath);
            throw new ServerErrorException("Failed to update database", new { error = "Failed to update database" });
        }

        DeleteReplacedImage(change);
        return imagePath;
    }

    public Task<List<ProductGallery>> GetGalleryAsync(int productId) => provider.GetGalleryAsync(productId);

    public async Task<(ProductGalleryCreated Gallery, string ImagePath)> UploadGalleryImageAsync(UploadGalleryImageDto upload)
    {
        EnsureValidImage(upload.Image, asServerError: false);

        if (!await provider.ExistsAsync(upload.Product_Id))
            throw new NotFoundException("Product not found", new { error = "Product not found" });

        var imagePath = await SaveImageAsync(upload.Image, GalleryImageFolder, "gallery", upload.Product_Id);

        try
        {
            var gallery = await provider.CreateGalleryImageAsync(upload.Product_Id, imagePath, upload.Display_Order);
            return (gallery, imagePath);
        }
        catch
        {
            imageStorage.Delete(imagePath);
            throw;
        }
    }

    public async Task<bool> DeleteGalleryImageAsync(int galleryId)
    {
        var imagePath = await provider.DeleteGalleryImageAsync(galleryId);
        if (imagePath == null)
            return false;

        imageStorage.Delete(imagePath);
        return true;
    }

    public Task ReorderGalleryAsync(List<ReorderGalleryImageDto> reorderList) =>
        provider.ReorderGalleryAsync(reorderList.Select(item => (item.Gallery_Id, item.NewDisplayOrder)));

    public Task<bool> SetMainImageAsync(SetMainImageDto setMain) =>
        provider.SetMainGalleryImageAsync(setMain.Gallery_Id, setMain.Product_Id);

    public async Task<object> BulkUpdateAsync(BulkUpdateDto bulkUpdate)
    {
        if (bulkUpdate.ProductIds == null || bulkUpdate.ProductIds.Count == 0)
            throw new BadRequestException("No products selected", new { error = "No products selected" });

        var ids = bulkUpdate.ProductIds;

        switch (bulkUpdate.Action.ToLower())
        {
            case "out-of-stock":
            {
                var result = await provider.BulkSetQuantityAsync(ids, 0);
                return new
                {
                    status = true,
                    message = $"{result.ProductsAffected} product(s) and {result.VariantsAffected} variant(s) set to out of stock",
                    productsAffected = result.ProductsAffected,
                    variantsAffected = result.VariantsAffected
                };
            }

            case "in-stock":
            {
                var result = await provider.BulkSetQuantityAsync(ids, 100);
                return new
                {
                    status = true,
                    message = $"{result.ProductsAffected} product(s) and {result.VariantsAffected} variant(s) set to in stock",
                    productsAffected = result.ProductsAffected,
                    variantsAffected = result.VariantsAffected
                };
            }

            case "discount":
            {
                if (!bulkUpdate.Value.HasValue || bulkUpdate.Value <= 0)
                    throw new BadRequestException("Discount percentage is required", new { error = "Discount percentage is required" });

                if (bulkUpdate.Value > 100)
                    throw new BadRequestException("Discount percentage cannot exceed 100%", new { error = "Discount percentage cannot exceed 100%" });

                var discountMultiplier = (100 - bulkUpdate.Value.Value) / 100m;
                var productsAffected = await provider.BulkApplyDiscountAsync(ids, discountMultiplier);
                return new
                {
                    status = true,
                    message = $"{productsAffected} product(s) had {bulkUpdate.Value}% discount applied",
                    productsAffected,
                    discountPercentage = bulkUpdate.Value
                };
            }

            case "remove-discount":
            {
                var productsAffected = await provider.BulkRemoveDiscountAsync(ids);
                return new
                {
                    status = true,
                    message = $"{productsAffected} product(s) discount removed",
                    productsAffected
                };
            }

            default:
            {
                var message = $"Unknown action: {bulkUpdate.Action}. Allowed: 'out-of-stock', 'in-stock', 'discount', 'remove-discount'";
                throw new BadRequestException(message, new { error = message });
            }
        }
    }

    public async Task<ProductBulkResult> BulkSetStockAsync(BulkStockUpdateDto stockUpdate)
    {
        if (stockUpdate.ProductIds == null || stockUpdate.ProductIds.Count == 0)
            throw new BadRequestException("No products selected", new { error = "No products selected" });

        if (stockUpdate.Quantity < 0)
            throw new BadRequestException("Quantity cannot be negative", new { error = "Quantity cannot be negative" });

        return await provider.BulkSetQuantityAsync(stockUpdate.ProductIds, stockUpdate.Quantity);
    }

    private async Task<List<int>> ExpandCategoryIdsAsync(List<int> categoryIds)
    {
        if (categoryIds.Count == 0)
            return [];

        var tree = await provider.GetCategoryTreeAsync();
        var parentByCategoryId = tree.ToDictionary(category => category.Category_Id, category => category.Parent_Category_Id);
        var childrenByParentId = tree
            .Where(category => category.Parent_Category_Id.HasValue)
            .ToLookup(category => category.Parent_Category_Id!.Value, category => category.Category_Id);

        var effectiveIds = categoryIds.Count < 2
            ? categoryIds
            : categoryIds
                .Where(candidateAncestor => !categoryIds.Any(categoryId =>
                    categoryId != candidateAncestor &&
                    IsDescendantOf(categoryId, candidateAncestor, parentByCategoryId)))
                .ToList();

        var expanded = new HashSet<int>();
        foreach (var categoryId in effectiveIds)
        {
            var queue = new Queue<int>();
            queue.Enqueue(categoryId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                if (!expanded.Add(currentId))
                    continue;

                foreach (var childId in childrenByParentId[currentId])
                    queue.Enqueue(childId);
            }
        }

        return expanded.ToList();
    }

    private static bool IsDescendantOf(int categoryId, int possibleAncestorId, IReadOnlyDictionary<int, int?> parentByCategoryId)
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

    private static List<int> NormalizeFilterIds(IEnumerable<int>? ids) =>
        ids?.Where(id => id > 0).Distinct().ToList() ?? new List<int>();

    private static List<int> ParseIds(string? json) =>
        string.IsNullOrEmpty(json) || json == "null"
            ? new List<int>()
            : JsonConvert.DeserializeObject<List<int>>(json) ?? new List<int>();

    private static List<int> ParseIdsLenient(string? json)
    {
        try
        {
            return ParseIds(json);
        }
        catch
        {
            return new List<int>();
        }
    }

    private static void EnsureValidImage(IFormFile? file, bool asServerError)
    {
        string? error = null;

        if (file == null || file.Length == 0)
            error = "No image file provided";
        else if (!AllowedImageExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            error = "Invalid file type. Only JPG, PNG, and WEBP are allowed.";
        else if (file.Length > MaxImageBytes)
            error = "File size must be less than 5MB";

        if (error == null)
            return;

        if (asServerError)
            throw new ServerErrorException(error, new { error });

        throw new BadRequestException(error, new { error });
    }

    private Task<string> SaveImageAsync(IFormFile file, string folder, string prefix, int productId)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{prefix}_{productId}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString()[..8]}{extension}";
        return imageStorage.SaveFileAsync(file, folder, fileName);
    }

    private void DeleteReplacedImage(ProductImageChange change)
    {
        if (!string.IsNullOrEmpty(change.OldImg) && change.OldImg != change.NewImg)
            imageStorage.Delete(change.OldImg);
    }
}
