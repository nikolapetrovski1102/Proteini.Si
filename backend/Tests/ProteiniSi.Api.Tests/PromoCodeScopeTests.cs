using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>Promo codes limited to some products or categories only discount those items.</summary>
public class PromoCodeScopeTests
{
    private static PromoCodeEligibility Code(string appliesTo, string type = "percentage", decimal value = 10, decimal? max = null, decimal min = 0) => new()
    {
        PromoCodeId = 5, Code = "WHEY10", DiscountType = type, DiscountValue = value, MaximumDiscountAmount = max,
        MinimumOrderAmount = min, IsActive = true, AppliesTo = appliesTo
    };

    private static PromotionValidationDto Cart(decimal subtotal, params (int ProductId, decimal Price, int Quantity)[] items) => new()
    {
        Code = "whey10",
        Subtotal = subtotal,
        Items = items.Select(i => new PromotionCartLineDto { ProductId = i.ProductId, Price = i.Price, Quantity = i.Quantity }).ToList()
    };

    [Fact]
    public async Task AllProductsCodeDiscountsTheWholeCart()
    {
        var service = new PromotionService(new FakeProvider(Code(PromoScope.All)));
        var result = await service.ValidateAsync(Cart(3000, (1, 1000, 1), (2, 2000, 1)));
        Assert.Equal(300m, result.DiscountAmount);
    }

    [Fact]
    public async Task ScopedCodeOnlyDiscountsMatchingItems()
    {
        var provider = new FakeProvider(Code(PromoScope.Categories), eligible: [2]);
        var result = await new PromotionService(provider).ValidateAsync(Cart(5000, (1, 1000, 1), (2, 2000, 2)));

        Assert.Equal(400m, result.DiscountAmount);          // 10% of the 4000 the code applies to
        Assert.Equal(PromoScope.Categories, result.AppliesTo);
        Assert.Equal([1, 2], provider.AskedFor);
    }

    [Fact]
    public async Task FixedDiscountIsCappedAtTheMatchingItems()
    {
        var provider = new FakeProvider(Code(PromoScope.Products, "fixed", 500), eligible: [1]);
        var result = await new PromotionService(provider).ValidateAsync(Cart(2300, (1, 300, 1), (2, 2000, 1)));
        Assert.Equal(300m, result.DiscountAmount);
    }

    [Fact]
    public async Task MinimumOrderCountsTheWholeCart()
    {
        // 1000 of matching items, 3000 order: the 2500 minimum is met by the whole order.
        var provider = new FakeProvider(Code(PromoScope.Products, min: 2500), eligible: [1]);
        var result = await new PromotionService(provider).ValidateAsync(Cart(3000, (1, 1000, 1), (2, 2000, 1)));
        Assert.Equal(100m, result.DiscountAmount);
    }

    [Fact]
    public async Task ScopedCodeWithNoMatchingItemsIsRejected()
    {
        var withOthers = new PromotionService(new FakeProvider(Code(PromoScope.Products), eligible: []));
        var error = await Assert.ThrowsAsync<BadRequestException>(() => withOthers.ValidateAsync(Cart(2000, (2, 2000, 1))));
        Assert.Equal(PromotionMath.NoEligibleItems, error.Message);

        // An older checkout that doesn't send the cart lines can't use a scoped code.
        var noItems = new PromotionService(new FakeProvider(Code(PromoScope.Products), eligible: [2]));
        await Assert.ThrowsAsync<BadRequestException>(() => noItems.ValidateAsync(new PromotionValidationDto { Code = "WHEY10", Subtotal = 2000 }));
    }

    [Theory]
    [InlineData(null, null, null, "all", true)]
    [InlineData("ALL", new[] { 3 }, null, "all", true)]
    [InlineData("products", new int[0], null, null, false)]
    [InlineData("products", new[] { 4, 0, 4, 2 }, null, "products", true)]
    [InlineData("categories", null, new[] { 9 }, "categories", true)]
    [InlineData("categories", new[] { 1 }, null, null, false)]
    [InlineData("brands", new[] { 1 }, null, null, false)]
    public void CodeFormScopeIsValidated(string? appliesTo, int[]? productIds, int[]? categoryIds, string? expected, bool valid)
    {
        var dto = new PromotionCodeUpsertDto
        {
            Code = "x", DiscountValue = 10, AppliesTo = appliesTo,
            ProductIds = productIds?.ToList(), CategoryIds = categoryIds?.ToList()
        };

        if (!valid)
        {
            Assert.Throws<BadRequestException>(() => PromotionService.ToValues(dto));
            return;
        }

        var scope = PromotionService.ToValues(dto).Scope;
        Assert.Equal(expected, scope.AppliesTo);
        if (expected == PromoScope.Products) Assert.Equal([2, 4], scope.ProductIds);
        if (expected == PromoScope.Categories) Assert.Equal([9], scope.CategoryIds);
        if (expected == PromoScope.All) Assert.Empty(scope.ProductIds);
    }

    [Fact]
    public async Task PreviewShowsAUsableCodeEvenBelowTheMinimum()
    {
        var preview = await new PromotionService(new FakeProvider(Code(PromoScope.All, min: 2500))).GetPreviewAsync(" whey10 ");
        Assert.NotNull(preview);
        Assert.Equal("WHEY10", preview.Code);
        Assert.Equal(2500m, preview.MinimumOrderAmount);
        Assert.Empty(preview.ProductIds);
    }

    [Fact]
    public async Task PreviewListsTheProductsOfAScopedCode()
    {
        var preview = await new PromotionService(new FakeProvider(Code(PromoScope.Categories), eligible: [7, 3])).GetPreviewAsync("WHEY10");
        Assert.Equal([3, 7], preview!.ProductIds);
        Assert.Null(await new PromotionService(new FakeProvider(Code(PromoScope.Products), eligible: [])).GetPreviewAsync("WHEY10"));
    }

    [Fact]
    public async Task PreviewHidesUnusableCodes()
    {
        var inactive = Code(PromoScope.All);
        inactive.IsActive = false;
        Assert.Null(await new PromotionService(new FakeProvider(inactive)).GetPreviewAsync("WHEY10"));

        var expired = Code(PromoScope.All);
        expired.ValidUntil = DateTime.Now.AddDays(-1);
        Assert.Null(await new PromotionService(new FakeProvider(expired)).GetPreviewAsync("WHEY10"));

        var usedUp = Code(PromoScope.All);
        usedUp.UsageLimit = 5;
        usedUp.TimesUsed = 5;
        Assert.Null(await new PromotionService(new FakeProvider(usedUp)).GetPreviewAsync("WHEY10"));

        Assert.Null(await new PromotionService(new FakeProvider(null)).GetPreviewAsync("NOPE"));
    }

    [Fact]
    public void AdminListParsesTheTargetIds()
    {
        var code = new PromoCode { AppliesTo = PromoScope.Products, ProductIdList = "12,3, 7,x,3" };
        Assert.Equal([3, 7, 12], code.ProductIds);
        Assert.Empty(code.CategoryIds);
    }

    private sealed class FakeProvider(PromoCodeEligibility? code, int[]? eligible = null) : IPromotionProvider
    {
        public List<int> AskedFor { get; } = [];

        public Task<PromoCodeEligibility?> GetCodeForValidationAsync(string code1, string? customerEmail) => Task.FromResult(code);

        public Task<HashSet<int>> GetEligibleProductIdsAsync(int promoCodeId, IEnumerable<int> productIds)
        {
            AskedFor.AddRange(productIds);
            return Task.FromResult(eligible == null ? productIds.ToHashSet() : productIds.Where(eligible.Contains).ToHashSet());
        }

        public Task<List<int>> GetTargetProductIdsAsync(int promoCodeId) => Task.FromResult((eligible ?? []).ToList());
        public Task<List<ActiveFreeGift>> GetActiveFreeGiftsAsync(decimal subtotal) => throw new NotSupportedException();
        public Task<List<PromoCode>> GetCodesAsync() => throw new NotSupportedException();
        public Task<(PromotionWriteResult Result, int? PromoCodeId)> CreateCodeAsync(PromoCodeValues values) => throw new NotSupportedException();
        public Task<PromotionWriteResult> UpdateCodeAsync(int id, PromoCodeValues values) => throw new NotSupportedException();
        public Task<PromotionDeleteResult> DeleteCodeAsync(int id) => throw new NotSupportedException();
        public Task<List<FreeGift>> GetFreeGiftsAsync() => throw new NotSupportedException();
        public Task<(PromotionWriteResult Result, int? FreeGiftId)> CreateFreeGiftAsync(FreeGiftValues values) => throw new NotSupportedException();
        public Task<PromotionWriteResult> UpdateFreeGiftAsync(int id, FreeGiftValues values) => throw new NotSupportedException();
        public Task<PromotionDeleteResult> DeleteFreeGiftAsync(int id) => throw new NotSupportedException();
        public Task<List<PromoCodeUsageRow>> GetUsageReportAsync(DateTime? from, DateTime? to) => throw new NotSupportedException();
    }
}
