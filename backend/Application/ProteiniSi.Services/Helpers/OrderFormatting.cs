using System.Globalization;
using System.Net;

namespace ProteiniSi.Services.Helpers;

public static class OrderFormatting
{
    public static string HtmlEncode(object? value) =>
        WebUtility.HtmlEncode(Convert.ToString(value) ?? string.Empty);

    public static bool ToBoolean(object? value)
    {
        if (value == null)
            return false;

        try
        {
            return Convert.ToBoolean(value, CultureInfo.InvariantCulture);
        }
        catch
        {
            return false;
        }
    }

    public static string CsvValue(object? value)
    {
        var text = Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
            text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
