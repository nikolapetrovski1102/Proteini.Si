using System.Globalization;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class GiftVoucherService(IGiftVoucherProvider provider) : IGiftVoucherService
{
    public async Task<GiftVoucherValidationResult> ValidateAsync(GiftVoucherValidationDto validation)
    {
        var code = (validation.Code ?? string.Empty).Trim().ToUpperInvariant();
        if (code.Length < 8 || validation.OrderAmount <= 0)
            throw Failure("Enter a valid gift voucher code.");

        var voucher = await provider.GetByCodeAsync(code);
        if (voucher == null
            || !string.Equals(voucher.Status, "active", StringComparison.OrdinalIgnoreCase)
            || voucher.ValidFrom > DateTime.UtcNow
            || (voucher.ExpiresAt != null && voucher.ExpiresAt < DateTime.UtcNow)
            || voucher.RemainingValue <= 0)
        {
            throw Failure("This gift voucher is invalid, expired, disabled or has no remaining balance.");
        }

        return new GiftVoucherValidationResult(code, voucher.RemainingValue, Math.Min(voucher.RemainingValue, validation.OrderAmount));
    }

    public Task<PagedResult<GiftVoucher>> GetPagedAsync(string? search, string? status, int page, int pageSize) =>
        provider.GetPagedAsync(
            string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%",
            string.IsNullOrWhiteSpace(status) ? null : status.Trim().ToLowerInvariant(),
            (page - 1) * pageSize,
            pageSize);

    public async Task UpdateStatusAsync(int id, GiftVoucherStatusDto update)
    {
        var status = (update.Status ?? string.Empty).Trim().ToLowerInvariant();
        if (status is not ("active" or "disabled"))
            throw Failure("Status must be active or disabled.");

        if (!await provider.UpdateStatusAsync(id, status, update.ExpiresAt))
            throw new NotFoundException("Gift voucher not found.", new { status = false, message = "Gift voucher not found." });
    }

    public async Task<CsvExport> ExportReportAsync()
    {
        var csv = new StringBuilder("Code,Initial value,Remaining value,Status,Purchase order,Purchaser name,Purchaser email,Recipient name,Recipient email,Valid from,Expires,Redemption channel,Redemption order,Redemption amount,Redemption status,Redeemed by,Redemption date\r\n");
        foreach (var row in await provider.GetReportAsync())
        {
            csv.Append(Csv(row.Code)).Append(',').Append(Csv(row.InitialValue)).Append(',')
                .Append(Csv(row.RemainingValue)).Append(',').Append(Csv(row.Status)).Append(',')
                .Append(Csv(row.PurchasedOrderId)).Append(',').Append(Csv(row.PurchaserName)).Append(',')
                .Append(Csv(row.PurchaserEmail)).Append(',').Append(Csv(row.RecipientName)).Append(',')
                .Append(Csv(row.RecipientEmail)).Append(',').Append(Csv(FormatDate(row.ValidFrom))).Append(',')
                .Append(Csv(FormatDate(row.ExpiresAt))).Append(',').Append(Csv(row.RedemptionChannel)).Append(',')
                .Append(Csv(row.RedemptionOrderId)).Append(',')
                .Append(Csv(row.RedemptionAmount)).Append(',').Append(Csv(row.RedemptionStatus)).Append(',')
                .Append(Csv(row.RedeemedBy)).Append(',')
                .Append(Csv(FormatDate(row.RedemptionCreatedAt))).Append("\r\n");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
        return new CsvExport(bytes, $"gift-vouchers-{DateTime.UtcNow:yyyyMMdd-HHmm}.csv");
    }

    public async Task<GiftVoucherDetails> GetDetailsAsync(string code)
    {
        var normalized = NormalizeCode(code);
        return await provider.GetDetailsAsync(normalized)
               ?? throw new NotFoundException("No gift voucher with this code.", new { status = false, message = "No gift voucher with this code." });
    }

    public async Task<GiftVoucherDetails> RedeemInStoreAsync(GiftVoucherRedeemDto redeem, string? redeemedBy)
    {
        var code = NormalizeCode(redeem.Code);
        var amount = Math.Round(redeem.Amount, 2, MidpointRounding.AwayFromZero);
        if (amount <= 0) throw Failure("Enter an amount greater than zero.");
        var note = string.IsNullOrWhiteSpace(redeem.Note) ? null : redeem.Note.Trim();
        if (note is { Length: > 500 }) throw Failure("The note can be at most 500 characters.");

        await provider.RedeemInStoreAsync(code, amount, redeemedBy, note);
        return await GetDetailsAsync(code);
    }

    private static string NormalizeCode(string? code)
    {
        var normalized = (code ?? string.Empty).Trim().ToUpperInvariant();
        if (normalized.Length < 8 || normalized.Length > 64) throw Failure("Enter a valid gift voucher code.");
        return normalized;
    }

    private static BadRequestException Failure(string message) => new(message, new { status = false, message });

    private static string FormatDate(DateTime? value) =>
        value?.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) ?? string.Empty;

    private static string Csv(object? value)
    {
        var text = Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0])) text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
