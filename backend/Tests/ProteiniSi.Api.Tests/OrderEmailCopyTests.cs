using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class OrderEmailCopyTests
{
    [Theory]
    [InlineData("al", "al")]
    [InlineData("AL", "al")]
    [InlineData("sq", "al")]
    [InlineData("mk", "mk")]
    [InlineData(null, "mk")]
    [InlineData("en", "mk")]
    public void PicksTheCustomersLanguage(string? language, string expected) =>
        Assert.Equal(expected, OrderEmailCopy.For(language).Language);

    [Fact]
    public void EveryStatusHasTextInBothLanguages()
    {
        foreach (var copy in new[] { OrderEmailCopy.Macedonian, OrderEmailCopy.Albanian })
        {
            Assert.Equal(OrderEmailCopy.Macedonian.StatusTitles.Keys.Order(), copy.StatusTitles.Keys.Order());
            Assert.Equal(OrderEmailCopy.Macedonian.StatusLabels.Keys.Order(), copy.StatusLabels.Keys.Order());
            Assert.Equal(OrderEmailCopy.Macedonian.PaymentLabels.Keys.Order(), copy.PaymentLabels.Keys.Order());
            Assert.Equal(OrderEmailCopy.Macedonian.StatusMessages.Keys.Order(), copy.StatusMessages.Keys.Order());
        }
    }

    [Fact]
    public void FormatStringsAcceptTheirArguments()
    {
        foreach (var c in new[] { OrderEmailCopy.Macedonian, OrderEmailCopy.Albanian })
        {
            Assert.Contains("#1001", string.Format(c.PaidSubject, "1001"));
            Assert.Contains("1,6%", string.Format(c.CourierText, "MKD 3000.00", "MKD 30.00", "1,6"));
            Assert.Contains("MKD 48.02", string.Format(c.CourierThisOrder, "MKD 48.02"));
            Assert.Contains("#1001", string.Format(c.CancelledIntro, "Ana", "1001"));
            Assert.Contains("Ana", string.Format(c.Greeting, "Ana"));
        }
    }
}
