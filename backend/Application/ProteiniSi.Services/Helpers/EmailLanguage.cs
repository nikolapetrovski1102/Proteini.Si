namespace ProteiniSi.Services.Helpers;

/// <summary>Customer email language: Macedonian ("mk", the default) or Albanian ("al").</summary>
public static class EmailLanguage
{
    public const string Macedonian = "mk";
    public const string Albanian = "al";

    public static bool IsAlbanian(string? language) =>
        string.Equals(language?.Trim(), Albanian, StringComparison.OrdinalIgnoreCase)
        || string.Equals(language?.Trim(), "sq", StringComparison.OrdinalIgnoreCase);

    public static string Normalize(string? language) => IsAlbanian(language) ? Albanian : Macedonian;

    /// <summary>The language to store, or null when the client did not send a known one.</summary>
    public static string? OrNull(string? language) =>
        IsAlbanian(language) ? Albanian
        : string.Equals(language?.Trim(), Macedonian, StringComparison.OrdinalIgnoreCase) ? Macedonian
        : null;
}
