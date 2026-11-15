using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>Automatic discounts: what the admin may save, and that shop prices are re-synced after every change.</summary>
public class DiscountServiceTests
{
    private static DiscountWriteDto Valid() => new()
    {
        Name = "  USN Black Friday ", Percentage = 15, AppliesTo = "Brands", TargetIds = [3, 3, 0, 7],
        StartsOn = new DateTime(2026, 11, 20, 14, 30, 0), EndsOn = new DateTime(2026, 11, 30)
    };

    [Fact]
    public async Task SavesCleanedValuesAndSyncs()
    {
        var provider = new FakeProvider();
        var id = await new DiscountService(provider).CreateAsync(Valid());

        Assert.Equal(42, id);
        Assert.Equal("USN Black Friday", provider.Saved!.Name);
        Assert.Equal("brands", provider.Saved.AppliesTo);
        Assert.Equal([3, 7], provider.Saved.TargetIds);
        Assert.Equal(new DateTime(2026, 11, 20), provider.Saved.StartsOn);
        Assert.Equal(1, provider.Syncs);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(100)]
    [InlineData(-5)]
    public async Task RejectsPercentageOutsideRange(decimal percentage)
    {
        var provider = new FakeProvider();
        var dto = Valid();
        dto.Percentage = percentage;

        await Assert.ThrowsAsync<BadRequestException>(() => new DiscountService(provider).CreateAsync(dto));
        Assert.Null(provider.Saved);
        Assert.Equal(0, provider.Syncs);
    }

    [Fact]
    public async Task RejectsMissingTargetsUnknownScopeAndBackwardsDates()
    {
        var service = new DiscountService(new FakeProvider());

        var noTargets = Valid();
        noTargets.TargetIds = [0];
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAsync(noTargets));

        var badScope = Valid();
        badScope.AppliesTo = "all";
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAsync(badScope));

        var backwards = Valid();
        backwards.EndsOn = new DateTime(2026, 11, 1);
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAsync(backwards));

        var noName = Valid();
        noName.Name = "   ";
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAsync(noName));
    }

    [Fact]
    public async Task UpdateAndDeleteOfMissingDiscountAreNotFound()
    {
        var provider = new FakeProvider { Exists = false };
        var service = new DiscountService(provider);

        await Assert.ThrowsAsync<NotFoundException>(() => service.UpdateAsync(9, Valid()));
        await Assert.ThrowsAsync<NotFoundException>(() => service.DeleteAsync(9));
        Assert.Equal(0, provider.Syncs);
    }

    [Fact]
    public async Task DeleteSyncsSoPricesGoBack()
    {
        var provider = new FakeProvider();
        await new DiscountService(provider).DeleteAsync(42);
        Assert.Equal(1, provider.Syncs);
    }

    [Fact]
    public async Task ProductDiscountSavesVariantItemsAndIgnoresTargets()
    {
        var provider = new FakeProvider();
        await new DiscountService(provider).CreateAsync(new DiscountWriteDto
        {
            Name = "Whey week", Percentage = 10, AppliesTo = "products", TargetIds = [99],
            Items = [new() { ProductId = 1, VariantId = 5, NewPrice = 500 }, new() { ProductId = 1, VariantId = 5 }, new() { ProductId = 2 }, new() { ProductId = 0 }]
        });

        Assert.Equal("percent", provider.Saved!.Type);
        Assert.Empty(provider.Saved.TargetIds);
        Assert.Equal([(1, 5, (decimal?)null), (2, 0, null)], provider.Saved.Items.Select(i => (i.Product_Id, i.Variant_Id, i.New_Price)));
    }

    [Fact]
    public async Task NewPriceDiscountRoundsUpAndDropsPercentage()
    {
        var provider = new FakeProvider();
        await new DiscountService(provider).CreateAsync(new DiscountWriteDto
        {
            Name = "Gold whey", Type = "price", Percentage = 30, AppliesTo = "products",
            Items = [new() { ProductId = 1, VariantId = 5, NewPrice = 998.4m }]
        });

        Assert.Equal("price", provider.Saved!.Type);
        Assert.Null(provider.Saved.Percentage);
        Assert.Equal(999m, provider.Saved.Items.Single().New_Price);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(1999)]
    [InlineData(2500)]
    public async Task NewPriceMustBeSetAndBelowNormalPrice(int? newPrice)
    {
        var provider = new FakeProvider();
        var dto = new DiscountWriteDto
        {
            Name = "Gold whey", Type = "price", AppliesTo = "products",
            Items = [new() { ProductId = 1, VariantId = 5, NewPrice = newPrice }]
        };

        await Assert.ThrowsAsync<BadRequestException>(() => new DiscountService(provider).CreateAsync(dto));
        Assert.Null(provider.Saved);
    }

    [Fact]
    public async Task NewPriceIsOnlyForProducts()
    {
        var dto = Valid();
        dto.Type = "price";
        await Assert.ThrowsAsync<BadRequestException>(() => new DiscountService(new FakeProvider()).CreateAsync(dto));
    }

    private sealed class FakeProvider : IDiscountProvider
    {
        public bool Exists { get; set; } = true;
        public DiscountSave? Saved { get; private set; }
        public int Syncs { get; private set; }

        public Task<List<Discount>> GetAllAsync() => Task.FromResult(new List<Discount>());

        public Task<List<DiscountItemOption>> GetItemOptionsAsync() =>
            Task.FromResult(new List<DiscountItemOption> { new() { Product_Id = 1, Variant_Id = 5, Product_Name = "Whey", Price = 1999 } });

        public Task<int?> SaveAsync(DiscountSave discount)
        {
            if (!Exists) return Task.FromResult<int?>(null);
            Saved = discount;
            return Task.FromResult<int?>(discount.Id ?? 42);
        }

        public Task<bool> DeleteAsync(int id) => Task.FromResult(Exists);

        public Task<int> SyncAsync()
        {
            Syncs++;
            return Task.FromResult(0);
        }
    }
}
