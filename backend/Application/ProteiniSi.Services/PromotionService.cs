using System.Globalization;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class PromotionService(IPromotionProvider provider) : IPromotionService
{
    private const string DuplicateCode = "That promotion code already exists.";
    private const string CodeNotFound = "Promotion code not found.";
    private const string GiftNotFound = "Free gift not found.";
    private const string InvalidSelection = "The selected product or variant is invalid.";

    public Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal) =>
        provider.GetActiveFreeGiftsAsync(subtotal);

    public async Task<PromotionValidationResult> ValidateAsync(PromotionValidationDto validation)
    {
        var code = (validation.Code ?? string.Empty).Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(code))
            throw Failure("Enter a promotion code.");

        var promo = await provider.GetCodeForValidationAsync(code, validation.CustomerEmail);
        var error = ValidatePromotion(promo, validation.Subtotal);
        if (error != null)
            throw Failure(error);

        return new PromotionValidationResult(true, promo!.PromoCodeId, promo.Code, promo.Description, CalculateDiscount(promo, validation.Subtotal));
    }

    public Task<List<PromoCode>> GetCodesAsync() => provider.GetCodesAsync();

    public async Task<int> CreateCodeAsync(PromotionCodeUpsertDto code)
    {
        var (result, id) = await provider.CreateCodeAsync(ToValues(code));
        if (result == PromotionWriteResult.Duplicate)
            throw Failure(DuplicateCode);
        return id!.Value;
    }

    public async Task UpdateCodeAsync(int id, PromotionCodeUpsertDto code)
    {
        switch (await provider.UpdateCodeAsync(id, ToValues(code)))
        {
            case PromotionWriteResult.NotFound:
                throw new NotFoundException(CodeNotFound, new { message = CodeNotFound });
            case PromotionWriteResult.Duplicate:
                throw Failure(DuplicateCode);
        }
    }

    public async Task<bool> DeleteCodeAsync(int id)
    {
        var result = await provider.DeleteCodeAsync(id);
        if (result == PromotionDeleteResult.NotFound)
            throw new NotFoundException(CodeNotFound, new { message = CodeNotFound });
        return result == PromotionDeleteResult.Archived;
    }

    public Task<List<FreeGift>> GetFreeGiftsAsync() => provider.GetFreeGiftsAsync();

    public async Task<int> CreateFreeGiftAsync(FreeGiftUpsertDto gift)
    {
        var (result, id) = await provider.CreateFreeGiftAsync(ToValues(gift));
        if (result == PromotionWriteResult.InvalidSelection)
            throw Failure(InvalidSelection);
        return id!.Value;
    }

    public async Task UpdateFreeGiftAsync(int id, FreeGiftUpsertDto gift)
    {
        switch (await provider.UpdateFreeGiftAsync(id, ToValues(gift)))
        {
            case PromotionWriteResult.InvalidSelection:
                throw Failure(InvalidSelection);
            case PromotionWriteResult.NotFound:
                throw new NotFoundException(GiftNotFound, new { message = GiftNotFound });
        }
    }

    public async Task<bool> DeleteFreeGiftAsync(int id)
    {
        var result = await provider.DeleteFreeGiftAsync(id);
        if (result == PromotionDeleteResult.NotFound)
            throw new NotFoundException(GiftNotFound, new { message = GiftNotFound });
        return result == PromotionDeleteResult.Archived;
    }

    public Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to) =>
        provider.GetUsageReportAsync(from, to);

    public async Task<CsvExport> ExportUsageReportAsync(DateTime? from, DateTime? to)
    {
        var csv = new StringBuilder("Code,Order Number,Customer Email,Discount Amount,Used At\r\n");
        foreach (var row in await provider.GetUsageReportAsync(from, to))
        {
            csv.Append(Csv(row.Code)).Append(',')
               .Append(Csv(row.OrderNumber)).Append(',')
               .Append(Csv(row.CustomerEmail)).Append(',')
               .Append(row.DiscountAmount.ToString("0.00", CultureInfo.InvariantCulture)).Append(',')
               .Append(Csv(row.UsedAt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture))).Append("\r\n");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
        return new CsvExport(bytes, $"promo-code-usage-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static PromoCodeValues ToValues(PromotionCodeUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Code)) throw Failure("Code is required.");
        var code = dto.Code.Trim().ToUpperInvariant();
        var type = dto.DiscountType.Trim().ToLowerInvariant();
        if (type is not ("percentage" or "fixed")) throw Failure("Discount type must be percentage or fixed.");
        if (dto.DiscountValue <= 0) throw Failure("Discount value must be greater than zero.");
        if (type == "percentage" && dto.DiscountValue > 100) throw Failure("Percentage cannot exceed 100%.");
        if (dto.ValidFrom.HasValue && dto.ValidUntil.HasValue && dto.ValidUntil < dto.ValidFrom) throw Failure("End date must be after start date.");
        if (code.Length > 60) throw Failure("Code must be 60 characters or fewer.");
        if (dto.Description?.Length > 500) throw Failure("Description must be 500 characters or fewer.");

        return new PromoCodeValues
        {
            Code = code,
            Description = dto.Description,
            DiscountType = type,
            DiscountValue = dto.DiscountValue,
            MinimumOrderAmount = Math.Max(0, dto.MinimumOrderAmount),
            MaximumDiscountAmount = dto.MaximumDiscountAmount,
            UsageLimit = dto.UsageLimit,
            PerCustomerLimit = dto.PerCustomerLimit,
            ValidFrom = dto.ValidFrom,
            ValidUntil = dto.ValidUntil,
            IsActive = dto.IsActive
        };
    }

    private static FreeGiftValues ToValues(FreeGiftUpsertDto dto)
    {
        if (dto.ProductId <= 0) throw Failure("Select a product for the free gift.");
        if (dto.ValidFrom.HasValue && dto.ValidUntil.HasValue && dto.ValidUntil < dto.ValidFrom) throw Failure("End date must be after start date.");
        if (dto.DisplayName?.Length > 250) throw Failure("Display name must be 250 characters or fewer.");

        return new FreeGiftValues(dto.ProductId, dto.VariantId, dto.DisplayName, dto.MinimumOrderAmount, dto.ValidFrom, dto.ValidUntil, dto.IsActive);
    }

    private static string? ValidatePromotion(PromoCodeEligibility? promo, decimal subtotal)
    {
        if (promo == null || !promo.IsActive) return "This promotion code is invalid or inactive.";
        var now = DateTime.Now;
        if (promo.ValidFrom != null && now < promo.ValidFrom) return "This promotion has not started yet.";
        if (promo.ValidUntil != null && now > promo.ValidUntil) return "This promotion has expired.";
        if (subtotal < promo.MinimumOrderAmount) return $"Minimum order amount is MKD {promo.MinimumOrderAmount:0.00}.";
        if (promo.UsageLimit != null && promo.TimesUsed >= promo.UsageLimit) return "This promotion has reached its usage limit.";
        if (promo.PerCustomerLimit != null && promo.CustomerTimesUsed >= promo.PerCustomerLimit) return "You have already used this promotion the maximum number of times.";
        return null;
    }

    private static decimal CalculateDiscount(PromoCodeEligibility promo, decimal subtotal)
    {
        var discount = string.Equals(promo.DiscountType, "percentage", StringComparison.OrdinalIgnoreCase)
            ? subtotal * promo.DiscountValue / 100m
            : promo.DiscountValue;
        if (promo.MaximumDiscountAmount != null)
            discount = Math.Min(discount, promo.MaximumDiscountAmount.Value);
        return Math.Round(Math.Min(Math.Max(discount, 0m), subtotal), 2, MidpointRounding.AwayFromZero);
    }

    private static BadRequestException Failure(string message) => new(message, new { message });

    private static string Csv(string? value)
    {
        var text = value ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
            text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
