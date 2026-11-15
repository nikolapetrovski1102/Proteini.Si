using ProteiniSi.Models;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>The order value after the promo code decides how many loyalty points can be used.</summary>
public class LoyaltyRedeemTierTests
{
    [Theory]
    [InlineData(0, 0)]
    [InlineData(1499.99, 0)]
    [InlineData(1500, 100)]
    [InlineData(2999, 100)]
    [InlineData(3000, 300)]
    [InlineData(4999, 300)]
    [InlineData(5000, 500)]
    [InlineData(20000, 500)]
    public void Default_tiers(decimal orderValue, decimal expected) =>
        Assert.Equal(expected, new ShippingSettings().MaxRedeemablePoints(orderValue));

    [Fact]
    public void Unreadable_tiers_fall_back_to_the_defaults()
    {
        var settings = new ShippingSettings { LoyaltyRedeemTiers = "not json" };
        Assert.Equal(300, settings.MaxRedeemablePoints(3500));
    }

    [Fact]
    public void Custom_tiers_are_sorted_and_invalid_rows_dropped()
    {
        var settings = new ShippingSettings
        {
            LoyaltyRedeemTiers = """[{"minOrder":4000,"maxPoints":400},{"minOrder":1000,"maxPoints":50},{"minOrder":2000,"maxPoints":0}]"""
        };
        Assert.Equal([1000m, 4000m], settings.RedeemTiers.Select(t => t.MinOrder));
        Assert.Equal(50, settings.MaxRedeemablePoints(3999));
        Assert.Equal(400, settings.MaxRedeemablePoints(4000));
    }

    [Fact]
    public void Empty_tier_list_allows_no_points()
    {
        var settings = new ShippingSettings { LoyaltyRedeemTiers = "[]" };
        Assert.Equal(0, settings.MaxRedeemablePoints(10000));
    }
}
