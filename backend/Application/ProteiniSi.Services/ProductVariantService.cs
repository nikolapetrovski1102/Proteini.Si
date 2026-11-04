using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class ProductVariantService(IProductVariantProvider provider, IImageStorageService imageStorage) : IProductVariantService
{
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private const string VariantImageFolder = "variant-images";
    private const string GalleryImageFolder = "variant-gallery";
    private const int MaxColumnKeyLength = 50;
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public Task<List<ProductVariantDto>> GetByProductAsync(int productId) => provider.GetByProductAsync(productId);

    public Task<ProductVariantDto?> GetByIdAsync(int id) => provider.GetActiveByIdAsync(id);

    public async Task<int> CreateAsync(CreateProductVariantDto variant)
    {
        var sku = string.IsNullOrEmpty(variant.SKU) ? $"VAR-{variant.Product_Id}-{DateTime.Now.Ticks}" : variant.SKU;
        var values = BuildWriteValues(sku, variant.Option_Type, variant.LoyaltyPercentage,
            variant.Packaging_Name, variant.Weight_Grams);

        return await provider.CreateAsync(variant, values)
            ?? throw new BadRequestException("Product not found", new { message = "Product not found" });
    }

    public Task<bool> UpdateAsync(UpdateProductVariantDto variant) =>
        provider.UpdateAsync(variant, BuildWriteValues(variant.SKU, variant.Option_Type, variant.LoyaltyPercentage,
            variant.Packaging_Name, variant.Weight_Grams));

    public async Task<bool> DeleteAsync(int id)
    {
        var deleted = await provider.DeleteAsync(id);
        if (deleted == null)
            return false;

        imageStorage.Delete(deleted.ImagePath);
        return true;
    }

    public Task<string> UploadImageAsync(IFormFile image, int? variantId)
    {
        EnsureValidImage(image);
        return SaveImageAsync(image, VariantImageFolder, variantId ?? 0);
    }

    public Task<List<VariantGalleryDto>> GetGalleryAsync(int variantId) => provider.GetGalleryAsync(variantId);

    public async Task<(VariantGalleryCreated Gallery, string ImagePath)> UploadGalleryImageAsync(IFormFile image, int variantId)
    {
        EnsureValidImage(image);

        if (!await provider.ExistsActiveAsync(variantId))
            throw new NotFoundException("Variant not found", new { error = "Variant not found" });

        var imagePath = await SaveImageAsync(image, GalleryImageFolder, variantId);

        try
        {
            return (await provider.CreateGalleryImageAsync(variantId, imagePath), imagePath);
        }
        catch
        {
            imageStorage.Delete(imagePath);
            throw;
        }
    }

    public async Task<bool> DeleteGalleryImageAsync(int galleryId)
    {
        var deleted = await provider.DeleteGalleryImageAsync(galleryId);
        if (deleted == null)
            return false;

        imageStorage.Delete(deleted.ImagePath);
        return true;
    }

    public Task SetMainGalleryImageAsync(SetMainVariantGalleryImageDto dto) =>
        provider.SetMainGalleryImageAsync(dto.Variant_Id, dto.Gallery_Id);

    public async Task<VariantNutritionView?> GetNutritionAsync(int variantId)
    {
        var data = await provider.GetNutritionAsync(variantId);
        if (data == null)
            return null;

        if (data.Columns.Count == 0 || data.Rows.Count == 0)
            return new VariantNutritionView();

        return new VariantNutritionView
        {
            Columns = data.Columns.Select(c => new VariantNutritionColumnView
            {
                Column_Id = c.Column_Id,
                Column_Name = c.Column_Name,
                Display_Order = c.Display_Order,
                Is_First_Column = c.Is_First_Column
            }).ToList(),
            Rows = data.Rows.Select(r => new VariantNutritionRowView
            {
                Row_Id = r.Row_Id,
                Row_Name = r.Row_Name,
                Display_Order = r.Display_Order,
                Values = data.Values.Where(v => v.Row_Id == r.Row_Id).ToDictionary(
                    v => data.Columns.FirstOrDefault(c => c.Column_Id == v.Column_Id)?.Column_Name ?? "unknown",
                    v => v.Cell_Value)
            }).ToList()
        };
    }

    public Task<bool> SaveNutritionAsync(int variantId, VariantNutritionDto nutrition)
    {
        var columns = nutrition.Columns.Select(c =>
        {
            var name = c.Column_Name ?? "Unknown";
            return new NutritionColumnWrite(name, ToColumnKey(name), c.Display_Order, c.Is_First_Column);
        }).ToList();

        var rows = nutrition.Rows.Select(r => new NutritionRowWrite(
            r.Row_Name ?? "Unknown",
            r.Display_Order,
            nutrition.Columns.Select(c => r.Values != null && r.Values.ContainsKey(c.Column_Name)
                ? r.Values[c.Column_Name] ?? ""
                : "").ToList())).ToList();

        return provider.SaveNutritionAsync(variantId, columns, rows);
    }

    public Task DeleteNutritionAsync(int variantId) => provider.DeleteNutritionAsync(variantId);

    public async Task<NutritionTableData?> PasteNutritionTableAsync(int variantId, string rawText)
    {
        if (!await provider.ExistsActiveAsync(variantId))
            return null;

        List<string> columns;
        List<TableRowData> rows;
        try
        {
            (columns, rows) = new TableParserService().ParsePastedText(rawText);
        }
        catch (ArgumentException ex)
        {
            throw new ServerErrorException(ex.Message, new { error = ex.Message });
        }

        if (columns == null || columns.Count == 0)
            throw new BadRequestException("Could not detect table structure", new { error = "Could not detect table structure" });

        var rowsForJson = rows.Select(r => new { r.RowLabel, r.Cells, r.IndentLevel }).ToList();
        var saved = await provider.SetNutritionTableAsync(variantId,
            JsonConvert.SerializeObject(new { columns, rows = rowsForJson }),
            JsonConvert.SerializeObject(columns),
            JsonConvert.SerializeObject(rowsForJson));

        if (!saved)
            throw new ServerErrorException("Failed to save nutrition table", new { error = "Failed to save nutrition table" });

        return new NutritionTableData { Columns = columns, Rows = rows };
    }

    public async Task<NutritionTableData?> GetNutritionTableAsync(int variantId)
    {
        var json = await provider.GetNutritionTableJsonAsync(variantId);
        if (string.IsNullOrEmpty(json))
            return null;

        var table = JObject.Parse(json);
        var rows = new List<TableRowData>();

        if (table["rows"] is JArray rowsArray)
        {
            foreach (var row in rowsArray)
            {
                rows.Add(new TableRowData
                {
                    RowLabel = row["RowLabel"]?.ToString() ?? "",
                    Cells = row["Cells"]?.ToObject<List<string>>() ?? new List<string>(),
                    IndentLevel = row["IndentLevel"]?.ToObject<int>() ?? 0
                });
            }
        }

        return new NutritionTableData
        {
            Columns = table["columns"]?.ToObject<List<string>>() ?? new List<string>(),
            Rows = rows
        };
    }

    public Task<bool> UpdateNutritionTableAsync(int variantId, UpdateNutritionTableDto table) =>
        provider.SetNutritionTableAsync(variantId,
            JsonConvert.SerializeObject(new { columns = table.Columns, rows = table.Rows }),
            JsonConvert.SerializeObject(table.Columns),
            JsonConvert.SerializeObject(table.Rows));

    public Task<bool> DeleteNutritionTableAsync(int variantId) =>
        provider.SetNutritionTableAsync(variantId, null, null, null);

    public Task<dynamic?> GetParentProductAsync(int variantId) => provider.GetParentProductAsync(variantId);

    public Task<dynamic?> GetWithParentAsync(int id) => provider.GetWithParentAsync(id);

    private static VariantWriteValues BuildWriteValues(string? sku, string? optionType, decimal? loyaltyPercentage,
        string? packagingName, decimal? weightGrams) =>
        new()
        {
            Sku = sku,
            OptionType = string.Equals(optionType?.Trim(), "color", StringComparison.OrdinalIgnoreCase) ? "color" : "flavor",
            LoyaltyPercentage = loyaltyPercentage ?? 2.0m,
            PackagingLookupName = string.IsNullOrWhiteSpace(packagingName) ? null : packagingName.Trim(),
            PackagingWeight = weightGrams > 0 ? weightGrams : null,
            HasPackagingWeight = weightGrams.HasValue
        };

    private static string ToColumnKey(string columnName)
    {
        var key = Regex.Replace(columnName.Trim().ToLowerInvariant().Replace("%", "percent"), @"[^\p{L}\p{N}\s_]", "");
        key = Regex.Replace(key.Trim(), @"\s+", "_");
        return key.Length > MaxColumnKeyLength ? key[..MaxColumnKeyLength] : key;
    }

    private static void EnsureValidImage(IFormFile? file)
    {
        string? error = null;

        if (file == null || file.Length == 0)
            error = "No image file provided";
        else if (!AllowedImageExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            error = "Invalid file type. Only JPG, PNG, and WEBP are allowed.";
        else if (file.Length > MaxImageBytes)
            error = "File size must be less than 5MB";

        if (error != null)
            throw new BadRequestException(error, new { error });
    }

    private Task<string> SaveImageAsync(IFormFile file, string folder, int variantId)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"variant_{variantId}_{DateTime.Now.Ticks}_{Guid.NewGuid().ToString()[..8]}{extension}";
        return imageStorage.SaveFileAsync(file, folder, fileName);
    }
}
