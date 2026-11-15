using ProteiniSi.Contracts.Providers;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class AffiliateProvider(ISqlHelper sql) : IAffiliateProvider
{
    public Task<List<AffiliateSummary>> GetAllAsync(DateTime? from, DateTime? to) =>
        sql.QueryAsync<AffiliateSummary>(StoredProcedures.Affiliates.GetAll, new { From = from?.Date, To = to?.Date });

    public Task<AffiliateDetails?> GetDetailsAsync(int id, DateTime? from, DateTime? to) =>
        sql.QueryMultipleAsync(StoredProcedures.Affiliates.GetDetails, new { AffiliateId = id, From = from?.Date, To = to?.Date }, async grid =>
        {
            var affiliate = await grid.ReadSingleOrDefaultAsync<AffiliateProfile>();
            var codes = (await grid.ReadAsync<AffiliateCode>()).ToList();
            var links = (await grid.ReadAsync<ShortLink>()).ToList();
            var orders = (await grid.ReadAsync<AffiliateOrder>()).ToList();
            return affiliate == null
                ? null
                : new AffiliateDetails { Affiliate = affiliate, Codes = codes, Links = links, Orders = orders };
        });

    public async Task<int> CreateAsync(AffiliateValues values) =>
        (await sql.QuerySingleOrDefaultAsync<WriteRow>(StoredProcedures.Affiliates.Create, values))!.Id!.Value;

    public async Task<AffiliateWriteResult> UpdateAsync(int id, AffiliateValues values) =>
        (AffiliateWriteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Affiliates.Update, new
        {
            AffiliateId = id,
            values.Name,
            values.Handle,
            values.Email,
            values.Phone,
            values.CommissionPercent,
            values.Notes,
            values.IsActive
        });

    public async Task<PromotionDeleteResult> DeleteAsync(int id) =>
        (PromotionDeleteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Affiliates.Delete, new { Id = id });

    public async Task<(AffiliateWriteResult Result, int? PromoCodeId)> AddCodeAsync(int affiliateId, PromoCodeValues values)
    {
        var row = await sql.QuerySingleOrDefaultAsync<WriteRow>(StoredProcedures.Affiliates.AddCode, new
        {
            AffiliateId = affiliateId,
            values.Code,
            values.Description,
            values.DiscountType,
            values.DiscountValue,
            values.MinimumOrderAmount,
            values.MaximumDiscountAmount,
            values.UsageLimit,
            values.PerCustomerLimit,
            values.ValidFrom,
            values.ValidUntil,
            values.IsActive,
            values.Scope.AppliesTo,
            ProductIds = TableParameters.IntList(values.Scope.ProductIds),
            CategoryIds = TableParameters.IntList(values.Scope.CategoryIds)
        });
        return ((AffiliateWriteResult)row!.Result, row.Id);
    }

    public async Task<AffiliateWriteResult> SetCodeOwnerAsync(int promoCodeId, int? affiliateId) =>
        (AffiliateWriteResult)await sql.ExecuteScalarAsync<int>(StoredProcedures.Affiliates.SetCodeOwner, new { PromoCodeId = promoCodeId, AffiliateId = affiliateId });

    public async Task<(AffiliateWriteResult Result, AffiliateQuickCreateResult? Created)> QuickCreateAsync(AffiliateQuickCreateValues values)
    {
        var row = await sql.QuerySingleOrDefaultAsync<QuickCreateRow>(StoredProcedures.Affiliates.QuickCreate, new
        {
            values.Affiliate.Name,
            values.Affiliate.Handle,
            values.Affiliate.Email,
            values.Affiliate.Phone,
            values.Affiliate.CommissionPercent,
            values.Affiliate.Notes,
            values.Affiliate.IsActive,
            values.Code,
            values.DiscountType,
            values.DiscountValue,
            values.MinimumOrderAmount,
            values.PerCustomerLimit,
            values.ValidUntil,
            values.Slug,
            values.TargetPath,
            values.Scope.AppliesTo,
            ProductIds = TableParameters.IntList(values.Scope.ProductIds),
            CategoryIds = TableParameters.IntList(values.Scope.CategoryIds)
        });
        // QuickCreate reports 1 = duplicate code, 2 = duplicate slug, which match AffiliateWriteResult.
        var result = (AffiliateWriteResult)row!.Result;
        return result == AffiliateWriteResult.Success
            ? (result, new AffiliateQuickCreateResult(row.AffiliateId!.Value, row.PromoCodeId!.Value, row.ShortLinkId!.Value))
            : (result, null);
    }

    public Task<List<ShortLink>> GetLinksAsync(DateTime? from, DateTime? to) =>
        sql.QueryAsync<ShortLink>(StoredProcedures.ShortLinks.GetAll, new { From = from?.Date, To = to?.Date });

    // The link procedures report 1 = slug exists, 2 = code/affiliate missing, 4 = not found.
    private static AffiliateWriteResult FromLinkResult(int result) => result switch
    {
        0 => AffiliateWriteResult.Success,
        1 => AffiliateWriteResult.DuplicateSlug,
        2 => AffiliateWriteResult.InvalidReference,
        _ => AffiliateWriteResult.NotFound
    };

    public async Task<(AffiliateWriteResult Result, int? ShortLinkId)> CreateLinkAsync(ShortLinkValues values)
    {
        var row = await sql.QuerySingleOrDefaultAsync<WriteRow>(StoredProcedures.ShortLinks.Create, values);
        return (FromLinkResult(row!.Result), row.Id);
    }

    public async Task<AffiliateWriteResult> UpdateLinkAsync(int id, ShortLinkValues values) =>
        FromLinkResult(await sql.ExecuteScalarAsync<int>(StoredProcedures.ShortLinks.Update, new
        {
            ShortLinkId = id,
            values.Slug,
            values.TargetPath,
            values.PromoCodeId,
            values.AffiliateId,
            values.Label,
            values.IsActive
        }));

    public async Task<AffiliateWriteResult> DeleteLinkAsync(int id) =>
        FromLinkResult(await sql.ExecuteScalarAsync<int>(StoredProcedures.ShortLinks.Delete, new { Id = id }));

    public Task<ShortLinkTarget?> ResolveLinkAsync(string slug, DateOnly today, bool countClick) =>
        sql.QuerySingleOrDefaultAsync<ShortLinkTarget>(StoredProcedures.ShortLinks.Resolve, new
        {
            Slug = slug,
            Today = today.ToDateTime(TimeOnly.MinValue),
            CountClick = countClick
        });

    private sealed class WriteRow
    {
        public int Result { get; init; }
        public int? Id { get; init; }
    }

    private sealed class QuickCreateRow
    {
        public int Result { get; init; }
        public int? AffiliateId { get; init; }
        public int? PromoCodeId { get; init; }
        public int? ShortLinkId { get; init; }
    }
}
