using System.Globalization;
using System.Text;

namespace ProteiniSi.Services.Helpers;

public static class SlugHelper
{
    public static string Normalize(string? value)
    {
        var normalized = (value ?? string.Empty).Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var slug = new StringBuilder();
        var previousDash = false;

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) == UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(character))
            {
                slug.Append(character);
                previousDash = false;
            }
            else if (!previousDash && slug.Length > 0)
            {
                slug.Append('-');
                previousDash = true;
            }
        }

        return slug.ToString().Trim('-');
    }
}
