using System.Globalization;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

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

        var eligibleSubtotal = validation.Subtotal;
        if (!PromoScope.IsAll(promo!.AppliesTo))
        {
            var lines = (validation.Items ?? [])
                .Where(item => item.ProductId > 0 && item.Quantity > 0 && item.Price >= 0)
                .Select(item => (item.ProductId, LineTotal: item.Price * item.Quantity))
                .ToList();
            var eligible = lines.Count == 0
                ? new HashSet<int>()
                : await provider.GetEligibleProductIdsAsync(promo.PromoCodeId, lines.Select(line => line.ProductId));
            eligibleSubtotal = Math.Min(PromotionMath.EligibleSubtotal(lines, eligible), validation.Subtotal);
            if (eligibleSubtotal <= 0)
                throw Failure(PromotionMath.NoEligibleItems);
        }

        return new PromotionValidationResult(true, promo.PromoCodeId, promo.Code, promo.Description,
            PromotionMath.Discount(promo.DiscountType, promo.DiscountValue, promo.MaximumDiscountAmount, eligibleSubtotal),
            promo.AppliesTo);
    }

    public async Task<PromotionPreview?> GetPreviewAsync(string code)
    {
        var normalized = (code ?? string.Empty).Trim().ToUpperInvariant();
        if (normalized.Length is 0 or > 60) return null;

        var promo = await provider.GetCodeForValidationAsync(normalized, null);
        // The minimum order is checked against the cart at checkout, so it doesn't hide the preview.
        if (promo == null || ValidatePromotion(promo, decimal.MaxValue) != null) return null;

        var all = PromoScope.IsAll(promo.AppliesTo);
        var productIds = all ? [] : await provider.GetTargetProductIdsAsync(promo.PromoCodeId);
        if (!all && productIds.Count == 0) return null;

        return new PromotionPreview(promo.Code, promo.Description, promo.DiscountType.ToLowerInvariant(), promo.DiscountValue,
            promo.MinimumOrderAmount, promo.MaximumDiscountAmount, promo.ValidUntil,
            all ? PromoScope.All : promo.AppliesTo.ToLowerInvariant(), productIds.Distinct().Order().ToList());
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

    public static PromoCodeValues ToValues(PromotionCodeUpsertDto dto)
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
        var (scope, scopeError) = PromotionMath.ToScope(dto);
        if (scopeError != null) throw Failure(scopeError);

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
            IsActive = dto.IsActive,
            Scope = scope!
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
        if (subtotal < promo.MinimumOrderAmount) return $"Minimum order amount is {PriceFormat.Mkd(promo.MinimumOrderAmount)}.";
        if (promo.UsageLimit != null && promo.TimesUsed >= promo.UsageLimit) return "This promotion has reached its usage limit.";
        if (promo.PerCustomerLimit != null && promo.CustomerTimesUsed >= promo.PerCustomerLimit) return "You have already used this promotion the maximum number of times.";
        return null;
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
