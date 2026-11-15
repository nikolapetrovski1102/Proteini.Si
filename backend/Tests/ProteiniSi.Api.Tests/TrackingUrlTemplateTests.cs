using ProteiniSi.Models;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class TrackingUrlTemplateTests
{
    [Theory]
    [InlineData("https://courier.mk/track?n={number}", " AB 123 ", "https://courier.mk/track?n=AB%20123")]
    [InlineData("https://courier.mk/{NUMBER}/status", "555", "https://courier.mk/555/status")]
    [InlineData("https://courier.mk/track", "555", null)]
    [InlineData(null, "555", null)]
    [InlineData("https://courier.mk/track?n={number}", "  ", null)]
    public void Builds_link_from_tracking_number(string? template, string? number, string? expected)
    {
        Assert.Equal(expected, new ShippingSettings { TrackingUrlTemplate = template }.TrackingUrlFor(number));
    }
}
