namespace ProteiniSi.Services.Helpers;

public static class TextHelper
{
    public static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public static bool IsLongerThan(string? value, int maxLength) =>
        (value?.Trim().Length ?? 0) > maxLength;
}
