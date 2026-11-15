using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>Short links must only ever send visitors to pages on proteini.mk.</summary>
public class AffiliateLinkTests
{
    [Theory]
    [InlineData(null, "/")]
    [InlineData("", "/")]
    [InlineData("/all-products", "/all-products")]
    [InlineData("all-products", "/all-products")]
    [InlineData("https://proteini.mk/product/12?x=1", "/product/12?x=1")]
    [InlineData("https://www.proteini.mk/", "/")]
    public async Task Target_is_normalized_to_a_site_path(string? input, string expected)
    {
        var provider = new FakeProvider();
        await new AffiliateService(provider).CreateLinkAsync(new ShortLinkUpsertDto { Slug = "Marko-10", TargetPath = input });

        Assert.Equal(expected, provider.LastLink!.TargetPath);
        Assert.Equal("marko-10", provider.LastLink.Slug);
    }

    [Fact]
    public void Public_resolve_is_never_output_cached()
    {
        // The global output-cache policy caches anonymous GETs; a cached redirect would stop counting clicks
        // and keep serving links after they were edited or switched off.
        var method = typeof(ProteiniSi.Api.Controllers.AffiliatesController).GetMethod("Resolve")!;
        var attribute = method.GetCustomAttributes(typeof(Microsoft.AspNetCore.OutputCaching.OutputCacheAttribute), false)
            .Cast<Microsoft.AspNetCore.OutputCaching.OutputCacheAttribute>()
            .SingleOrDefault();
        Assert.True(attribute?.NoStore);
    }

    [Theory]
    [InlineData("https://evil.example/")]
    [InlineData("https://proteini.mk.evil.example/")]
    [InlineData("//evil.example")]
    [InlineData("/\\evil.example")]
    [InlineData("javascript:alert(1)")]
    [InlineData("/path with space")]
    public async Task Off_site_targets_are_rejected(string input)
    {
        var service = new AffiliateService(new FakeProvider());
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateLinkAsync(new ShortLinkUpsertDto { Slug = "ok", TargetPath = input }));
    }

    [Theory]
    [InlineData("a")]
    [InlineData("-marko")]
    [InlineData("marko-")]
    [InlineData("mar ko")]
    [InlineData("марко")]
    public async Task Invalid_slugs_are_rejected(string slug)
    {
        var service = new AffiliateService(new FakeProvider());
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateLinkAsync(new ShortLinkUpsertDto { Slug = slug }));
    }

    [Fact]
    public async Task Resolve_never_returns_an_unsafe_stored_path()
    {
        var provider = new FakeProvider { Target = new ShortLinkTarget { TargetPath = "//evil.example", Code = "MARKO10" } };
        var target = await new AffiliateService(provider).ResolveLinkAsync("MARKO", countClick: false);

        Assert.Equal("/", target!.TargetPath);
        Assert.Equal("MARKO10", target.Code);
        Assert.Equal("marko", provider.LastResolvedSlug);
    }

    [Fact]
    public async Task Resolve_skips_the_database_for_malformed_slugs()
    {
        var provider = new FakeProvider { Target = new ShortLinkTarget() };
        Assert.Null(await new AffiliateService(provider).ResolveLinkAsync("../admin", countClick: true));
        Assert.Null(provider.LastResolvedSlug);
    }

    [Fact]
    public async Task Quick_create_rejects_percentage_over_100()
    {
        var service = new AffiliateService(new FakeProvider());
        await Assert.ThrowsAsync<BadRequestException>(() => service.QuickCreateAsync(new AffiliateQuickCreateDto
        {
            Name = "Marko", Code = "MARKO", DiscountType = "percentage", DiscountValue = 150, Slug = "marko"
        }));
    }

    [Fact]
    public async Task Quick_create_keeps_the_code_scope()
    {
        var provider = new FakeProvider();
        await new AffiliateService(provider).QuickCreateAsync(new AffiliateQuickCreateDto
        {
            Name = "Marko", Code = "MARKO", DiscountValue = 10, Slug = "marko",
            AppliesTo = "categories", CategoryIds = [7, 7, 3]
        });

        Assert.Equal("categories", provider.LastQuick!.Scope.AppliesTo);
        Assert.Equal([3, 7], provider.LastQuick.Scope.CategoryIds);
    }

    private sealed class FakeProvider : IAffiliateProvider
    {
        public AffiliateQuickCreateValues? LastQuick;
        public ShortLinkValues? LastLink;
        public ShortLinkTarget? Target;
        public string? LastResolvedSlug;

        public Task<(AffiliateWriteResult Result, int? ShortLinkId)> CreateLinkAsync(ShortLinkValues values)
        {
            LastLink = values;
            return Task.FromResult<(AffiliateWriteResult, int?)>((AffiliateWriteResult.Success, 1));
        }

        public Task<ShortLinkTarget?> ResolveLinkAsync(string slug, DateOnly today, bool countClick)
        {
            LastResolvedSlug = slug;
            return Task.FromResult(Target);
        }

        public Task<(AffiliateWriteResult Result, AffiliateQuickCreateResult? Created)> QuickCreateAsync(AffiliateQuickCreateValues values)
        {
            LastQuick = values;
            return Task.FromResult<(AffiliateWriteResult, AffiliateQuickCreateResult?)>((AffiliateWriteResult.Success, new AffiliateQuickCreateResult(1, 1, 1)));
        }

        public Task<List<AffiliateSummary>> GetAllAsync(DateTime? from, DateTime? to) => throw new NotSupportedException();
        public Task<AffiliateDetails?> GetDetailsAsync(int id, DateTime? from, DateTime? to) => throw new NotSupportedException();
        public Task<int> CreateAsync(AffiliateValues values) => throw new NotSupportedException();
        public Task<AffiliateWriteResult> UpdateAsync(int id, AffiliateValues values) => throw new NotSupportedException();
        public Task<PromotionDeleteResult> DeleteAsync(int id) => throw new NotSupportedException();
        public Task<(AffiliateWriteResult Result, int? PromoCodeId)> AddCodeAsync(int affiliateId, PromoCodeValues values) => throw new NotSupportedException();
        public Task<AffiliateWriteResult> SetCodeOwnerAsync(int promoCodeId, int? affiliateId) => throw new NotSupportedException();
        public Task<List<ShortLink>> GetLinksAsync(DateTime? from, DateTime? to) => throw new NotSupportedException();
        public Task<AffiliateWriteResult> UpdateLinkAsync(int id, ShortLinkValues values) => throw new NotSupportedException();
        public Task<AffiliateWriteResult> DeleteLinkAsync(int id) => throw new NotSupportedException();
    }
}
