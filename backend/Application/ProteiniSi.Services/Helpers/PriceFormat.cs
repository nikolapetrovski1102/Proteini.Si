using System.Globalization;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Prices are whole denars, always rounded up, with a dot between thousands ("899 MKD", "1.299 MKD"), the same as the shop.
/// A discount is rounded down instead, so the price left after it is the rounded-up one.
/// </summary>
public static class PriceFormat
{
    private static readonly NumberFormatInfo Dots = new() { NumberGroupSeparator = ".", NumberGroupSizes = [3] };

    public static decimal Round(decimal amount) => Math.Ceiling(amount);

    public static decimal RoundDiscount(decimal amount) => Math.Floor(amount);

    public static string Amount(decimal amount) => Round(amount).ToString("#,0", Dots);

    public static string Mkd(decimal amount) => $"{Amount(amount)} MKD";
}
