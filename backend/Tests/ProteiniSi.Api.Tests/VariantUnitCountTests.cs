using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>Pill count on capsule/tablet variants ("90 capsules") is saved only with a known form.</summary>
public class VariantUnitCountTests
{
    [Fact]
    public void CountWithFormIsKept() =>
        Assert.Equal((90, "tablets"), ProductVariantService.NormalizeUnits(90, " Tablets "));

    [Fact]
    public void CountWithoutFormDefaultsToCapsules() =>
        Assert.Equal((60, "capsules"), ProductVariantService.NormalizeUnits(60, null));

    [Theory]
    [InlineData(null, "capsules")]
    [InlineData(0, "tablets")]
    [InlineData(-5, null)]
    public void MissingCountClearsBoth(int? count, string? form) =>
        Assert.Equal(((int?)null, (string?)null), ProductVariantService.NormalizeUnits(count, form));

    [Fact]
    public void UnknownFormIsRejected() =>
        Assert.Throws<BadRequestException>(() => ProductVariantService.NormalizeUnits(30, "капсули"));

    [Fact]
    public void HugeCountIsRejected() =>
        Assert.Throws<BadRequestException>(() => ProductVariantService.NormalizeUnits(100000, "capsules"));

    [Theory]
    [InlineData("60 капсули", 60, "capsules")]
    [InlineData(" 120 caps ", 120, "capsules")]
    [InlineData("100 меки капсули", 100, "softgels")]
    [InlineData("80 таблети", 80, "tablets")]
    [InlineData("20 шумливи таблети", 20, "effervescent")]
    [InlineData("90 Tablets", 90, "tablets")]
    public void PillCountTextIsRead(string text, int count, string form) =>
        Assert.Equal((count, form), ProductVariantService.ParsePillCount(text));

    [Theory]
    [InlineData("Цитрус")]
    [InlineData("чоколадна торта")]
    [InlineData("b")]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("капсули")]
    public void RealFlavourIsNotAPillCount(string? text) =>
        Assert.Null(ProductVariantService.ParsePillCount(text));

    [Fact]
    public void PillCountFlavourFillsEmptyCountAndIsCleared() =>
        Assert.Equal(((int?)null, (string?)null, (int?)60, "capsules"),
            ProductVariantService.MovePillCountOutOfFlavor(12, "60 капсули", null, null));

    [Fact]
    public void PillCountFlavourKeepsTypedCount() =>
        Assert.Equal(((int?)null, (string?)null, (int?)90, "tablets"),
            ProductVariantService.MovePillCountOutOfFlavor(null, "60 капсули", 90, "tablets"));

    [Fact]
    public void RealFlavourIsKept() =>
        Assert.Equal(((int?)5, "Цитрус", (int?)80, "tablets"),
            ProductVariantService.MovePillCountOutOfFlavor(5, "Цитрус", 80, "tablets"));
}
