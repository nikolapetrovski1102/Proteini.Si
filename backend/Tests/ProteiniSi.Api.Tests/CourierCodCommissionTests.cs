using ProteiniSi.Models;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class CourierCodCommissionTests
{
    [Theory]
    [InlineData(500, 30)]
    [InlineData(2999.99, 30)]
    [InlineData(3000, 30)]        // "до 3000 ден" includes 3000
    [InlineData(3001, 48.02)]     // 1.6%
    [InlineData(5000, 80)]
    [InlineData(12345, 197.52)]
    public void Uses_fixed_fee_up_to_threshold_and_percentage_above(decimal amount, decimal expected) =>
        Assert.Equal(expected, new ShippingSettings().CourierCodCommission(amount));

    [Fact]
    public void Follows_admin_settings()
    {
        var settings = new ShippingSettings { CourierCodThreshold = 2000, CourierCodFixedFee = 40, CourierCodPercent = 2 };
        Assert.Equal(40, settings.CourierCodCommission(2000));
        Assert.Equal(50, settings.CourierCodCommission(2500));
    }
}
