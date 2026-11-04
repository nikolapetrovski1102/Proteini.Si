using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class SearchTermExpanderTests
{
    [Theory]
    [InlineData("Whey", "сурутка")]
    [InlineData("Сурутка", "whey")]
    [InlineData("Hirrë", "hirre")]
    [InlineData("Creatine", "креатин")]
    [InlineData("Креатин", "kreatin")]
    [InlineData("protien", "protein")]
    public void ExpandsMultilingualSynonymsAndTypos(string query, string expected)
    {
        var terms = SearchTermExpander.Expand(query);
        Assert.Contains(terms, value => string.Equals(value, expected, StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void ExpandsMacedonianLatinTransliteration()
    {
        var terms = SearchTermExpander.Expand("kreatin");
        Assert.Contains("креатин", terms);
    }

    [Fact]
    public void RemovesAlbanianDiacritics()
    {
        Assert.Equal("hirre", SearchTermExpander.Normalize("Hirrë"));
    }

    [Fact]
    public void ProducesSingularVariant()
    {
        var terms = SearchTermExpander.Expand("витамини");
        Assert.Contains("витамин", terms);
    }
}
