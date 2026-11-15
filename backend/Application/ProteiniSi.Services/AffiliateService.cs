using System.Globalization;
using System.Net.Mail;
using System.Text;
using System.Text.RegularExpressions;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

/// <summary>
/// Affiliate marketing: influencers own promo codes and short links (/r/&lt;slug&gt;). A link visit stores
/// the code in the browser and checkout applies it, so sales are attributed through the code.
/// </summary>
public partial class AffiliateService(IAffiliateProvider provider) : IAffiliateService
{
    private const string AffiliateNotFound = "Affiliate not found.";
    private const string LinkNotFound = "Short link not found.";
    private const string DuplicateCode = "That promotion code already exists.";
    private const string DuplicateSlug = "That short link is already taken.";

    private static readonly TimeZoneInfo Skopje = FindSkopje();

    public Task<List<AffiliateSummary>> GetAllAsync(DateTime? from, DateTime? to) => provider.GetAllAsync(from, to);

    public async Task<AffiliateDetails> GetDetailsAsync(int id, DateTime? from, DateTime? to) =>
        await provider.GetDetailsAsync(id, from, to)
        ?? throw new NotFoundException(AffiliateNotFound, new { message = AffiliateNotFound });

    public Task<int> CreateAsync(AffiliateUpsertDto dto) => provider.CreateAsync(ToValues(dto));

    public async Task UpdateAsync(int id, AffiliateUpsertDto dto)
    {
        if (await provider.UpdateAsync(id, ToValues(dto)) == AffiliateWriteResult.NotFound)
            throw new NotFoundException(AffiliateNotFound, new { message = AffiliateNotFound });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var result = await provider.DeleteAsync(id);
        if (result == PromotionDeleteResult.NotFound)
            throw new NotFoundException(AffiliateNotFound, new { message = AffiliateNotFound });
        return result == PromotionDeleteResult.Archived;
    }

    public async Task<int> AddCodeAsync(int affiliateId, PromotionCodeUpsertDto dto)
    {
        var (result, id) = await provider.AddCodeAsync(affiliateId, PromotionService.ToValues(dto));
        return result switch
        {
            AffiliateWriteResult.DuplicateCode => throw Failure(DuplicateCode),
            AffiliateWriteResult.NotFound => throw new NotFoundException(AffiliateNotFound, new { message = AffiliateNotFound }),
            _ => id!.Value
        };
    }

    public async Task SetCodeOwnerAsync(int promoCodeId, int? affiliateId)
    {
        if (await provider.SetCodeOwnerAsync(promoCodeId, affiliateId) == AffiliateWriteResult.NotFound)
            throw new NotFoundException("Promotion code or affiliate not found.", new { message = "Promotion code or affiliate not found." });
    }

    public async Task<AffiliateQuickCreateResult> QuickCreateAsync(AffiliateQuickCreateDto dto)
    {
        var affiliate = ToValues(dto);
        // Reuse the promo code rules (format, percentage range, dates).
        var code = PromotionService.ToValues(new PromotionCodeUpsertDto
        {
            Code = dto.Code,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinimumOrderAmount = dto.MinimumOrderAmount,
            PerCustomerLimit = dto.PerCustomerLimit,
            ValidUntil = dto.ValidUntil,
            IsActive = dto.IsActive,
            AppliesTo = dto.AppliesTo,
            ProductIds = dto.ProductIds,
            CategoryIds = dto.CategoryIds
        });
        if (dto.PerCustomerLimit is <= 0) throw Failure("Uses per customer must be at least 1, or empty for unlimited.");

        var (result, created) = await provider.QuickCreateAsync(new AffiliateQuickCreateValues
        {
            Affiliate = affiliate,
            Code = code.Code,
            DiscountType = code.DiscountType,
            DiscountValue = code.DiscountValue,
            MinimumOrderAmount = code.MinimumOrderAmount,
            PerCustomerLimit = code.PerCustomerLimit,
            ValidUntil = code.ValidUntil,
            Scope = code.Scope,
            Slug = NormalizeSlug(dto.Slug),
            TargetPath = NormalizeTargetPath(dto.TargetPath)
        });

        return result switch
        {
            AffiliateWriteResult.DuplicateCode => throw Failure(DuplicateCode),
            AffiliateWriteResult.DuplicateSlug => throw Failure(DuplicateSlug),
            _ => created!
        };
    }

    public async Task<CsvExport> ExportAsync(DateTime? from, DateTime? to)
    {
        var csv = new StringBuilder("Affiliate,Handle,Email,Codes,Short link,Clicks,Orders,Net sales,Discount given,Commission %,Commission,Active\r\n");
        foreach (var a in await provider.GetAllAsync(from, to))
        {
            csv.Append(Csv(a.Name)).Append(',')
               .Append(Csv(a.Handle)).Append(',')
               .Append(Csv(a.Email)).Append(',')
               .Append(Csv(a.ActiveCodes)).Append(',')
               .Append(Csv(a.PrimarySlug == null ? null : "/r/" + a.PrimarySlug)).Append(',')
               .Append(a.Clicks).Append(',')
               .Append(a.Orders).Append(',')
               .Append(Money(a.NetSales)).Append(',')
               .Append(Money(a.DiscountGiven)).Append(',')
               .Append(Money(a.CommissionPercent)).Append(',')
               .Append(Money(a.Commission)).Append(',')
               .Append(a.IsActive ? "yes" : "no").Append("\r\n");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
        var period = from.HasValue || to.HasValue ? $"-{from:yyyyMMdd}-{to:yyyyMMdd}" : string.Empty;
        return new CsvExport(bytes, $"affiliates{period}.csv");
    }

    public Task<List<ShortLink>> GetLinksAsync(DateTime? from, DateTime? to) => provider.GetLinksAsync(from, to);

    public async Task<int> CreateLinkAsync(ShortLinkUpsertDto dto)
    {
        var (result, id) = await provider.CreateLinkAsync(ToValues(dto));
        ThrowOnLinkFailure(result);
        return id!.Value;
    }

    public async Task UpdateLinkAsync(int id, ShortLinkUpsertDto dto) =>
        ThrowOnLinkFailure(await provider.UpdateLinkAsync(id, ToValues(dto)));

    public async Task DeleteLinkAsync(int id) =>
        ThrowOnLinkFailure(await provider.DeleteLinkAsync(id));

    public async Task<ShortLinkTarget?> ResolveLinkAsync(string slug, bool countClick)
    {
        var normalized = (slug ?? string.Empty).Trim().ToLowerInvariant();
        if (!SlugPattern().IsMatch(normalized)) return null;
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Skopje));
        var target = await provider.ResolveLinkAsync(normalized, today, countClick);
        if (target == null) return null;
        // Stored paths are validated on write; guard again so a link can never send visitors off-site.
        if (!IsSafeRelativePath(target.TargetPath)) target.TargetPath = "/";
        return target;
    }

    private static void ThrowOnLinkFailure(AffiliateWriteResult result)
    {
        switch (result)
        {
            case AffiliateWriteResult.DuplicateSlug: throw Failure(DuplicateSlug);
            case AffiliateWriteResult.InvalidReference: throw Failure("The selected promotion code or affiliate no longer exists.");
            case AffiliateWriteResult.NotFound: throw new NotFoundException(LinkNotFound, new { message = LinkNotFound });
        }
    }

    private static AffiliateValues ToValues(AffiliateUpsertDto dto)
    {
        var name = dto.Name?.Trim() ?? string.Empty;
        if (name.Length == 0) throw Failure("Name is required.");
        if (name.Length > 150) throw Failure("Name must be 150 characters or fewer.");
        if (dto.CommissionPercent is < 0 or > 100) throw Failure("Commission must be between 0% and 100%.");
        var email = Clean(dto.Email);
        if (email != null && (email.Length > 320 || !MailAddress.TryCreate(email, out _))) throw Failure("Enter a valid email address.");
        var handle = Clean(dto.Handle);
        if (handle?.Length > 150) throw Failure("Handle must be 150 characters or fewer.");
        var phone = Clean(dto.Phone);
        if (phone?.Length > 50) throw Failure("Phone must be 50 characters or fewer.");
        var notes = Clean(dto.Notes);
        if (notes?.Length > 1000) throw Failure("Notes must be 1000 characters or fewer.");

        return new AffiliateValues
        {
            Name = name,
            Handle = handle,
            Email = email,
            Phone = phone,
            CommissionPercent = Math.Round(dto.CommissionPercent, 2),
            Notes = notes,
            IsActive = dto.IsActive
        };
    }

    private static ShortLinkValues ToValues(ShortLinkUpsertDto dto)
    {
        var label = Clean(dto.Label);
        if (label?.Length > 150) throw Failure("Label must be 150 characters or fewer.");
        return new ShortLinkValues
        {
            Slug = NormalizeSlug(dto.Slug),
            TargetPath = NormalizeTargetPath(dto.TargetPath),
            PromoCodeId = dto.PromoCodeId is > 0 ? dto.PromoCodeId : null,
            AffiliateId = dto.AffiliateId is > 0 ? dto.AffiliateId : null,
            Label = label,
            IsActive = dto.IsActive
        };
    }

    internal static string NormalizeSlug(string? slug)
    {
        var value = (slug ?? string.Empty).Trim().ToLowerInvariant();
        if (!SlugPattern().IsMatch(value))
            throw Failure("Short link must be 2–60 characters: letters a–z, numbers and dashes.");
        return value;
    }

    /// <summary>Accepts "/products/x", "products/x" or a full proteini.mk URL and returns the site-relative path.</summary>
    internal static string NormalizeTargetPath(string? target)
    {
        var value = (target ?? string.Empty).Trim();
        if (value.Length == 0) return "/";

        if (Uri.TryCreate(value, UriKind.Absolute, out var absolute) && absolute.Scheme is "http" or "https")
        {
            var host = absolute.Host.ToLowerInvariant();
            if (host != "proteini.mk" && !host.EndsWith(".proteini.mk", StringComparison.Ordinal))
                throw Failure("Links can only point to pages on proteini.mk.");
            value = absolute.PathAndQuery + absolute.Fragment;
        }
        else if (!value.StartsWith('/'))
        {
            var colon = value.IndexOf(':');
            if (colon >= 0 && (value.IndexOf('/') is var slash && (slash < 0 || colon < slash)))
                throw Failure("Links can only point to pages on proteini.mk.");
            value = "/" + value;
        }

        if (!IsSafeRelativePath(value)) throw Failure("Enter a page on the site, for example /all-products.");
        if (value.Length > 500) throw Failure("The page address must be 500 characters or fewer.");
        return value;
    }

    private static bool IsSafeRelativePath(string? path) =>
        !string.IsNullOrEmpty(path)
        && path[0] == '/'
        && !path.StartsWith("//", StringComparison.Ordinal)
        && !path.Contains('\\')
        && !path.Any(c => char.IsWhiteSpace(c) || char.IsControl(c));

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string Money(decimal value) => value.ToString("0.00", CultureInfo.InvariantCulture);

    private static string Csv(string? value)
    {
        var text = value ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
            text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }

    private static TimeZoneInfo FindSkopje()
    {
        foreach (var id in new[] { "Europe/Skopje", "Central European Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }

    private static BadRequestException Failure(string message) => new(message, new { message });

    [GeneratedRegex("^[a-z0-9][a-z0-9-]{0,58}[a-z0-9]$")]
    private static partial Regex SlugPattern();
}
