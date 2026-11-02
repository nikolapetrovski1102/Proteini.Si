using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace ProteiniSi.Api.Services;

public static partial class SearchTermExpander
{
    private static readonly string[][] SynonymGroups =
    {
        new[] { "whey", "whey protein", "protein powder", "веј", "веј протеин", "сурутка", "hirrë", "hirre", "whey protien" },
        new[] { "protein", "proteins", "protein supplement", "протеин", "протеини", "proteina", "proteinë", "proteine", "протејн", "protien" },
        new[] { "creatine", "creatin", "креатин", "kreatin", "kreatinë", "kreatine", "creatine monohydrate", "креатин монохидрат" },
        new[] { "mass gainer", "gainer", "weight gainer", "гејнер", "маса", "мас гејнер", "shtues mase" },
        new[] { "pre workout", "pre-workout", "пред тренинг", "предтренинг", "pre trening", "para stërvitjes", "para stervitjes" },
        new[] { "amino", "amino acids", "аминокиселини", "амино", "aminoacide" },
        new[] { "bcaa", "бцаа", "branched chain amino" },
        new[] { "eaa", "еаа", "essential amino" },
        new[] { "vitamin", "vitamins", "витамин", "витамини", "vitamina" },
        new[] { "mineral", "minerals", "минерал", "минерали", "minerale" },
        new[] { "magnesium", "magnezium", "магнезиум", "магнезијум", "magnez" },
        new[] { "fat burner", "fat burners", "weight loss", "согорувач", "слабеење", "намалување тежина", "djegës yndyre", "humbje peshe" },
        new[] { "protein bar", "protein bars", "протеински бар", "протеински плочки", "proteinska plocka", "shufër proteinike" },
        new[] { "healthy food", "protein food", "здрава храна", "протеинска храна", "ushqim proteinik" }
    };

    private static readonly (string From, string To)[] LatinToCyrillicDigraphs =
    {
        ("dzh", "џ"), ("lj", "љ"), ("nj", "њ"), ("gj", "ѓ"), ("kj", "ќ"),
        ("zh", "ж"), ("ch", "ч"), ("sh", "ш")
    };

    private static readonly Dictionary<char, string> LatinToCyrillic = new()
    {
        ['a']="а", ['b']="б", ['v']="в", ['g']="г", ['d']="д", ['e']="е",
        ['z']="з", ['i']="и", ['j']="ј", ['k']="к", ['l']="л", ['m']="м",
        ['n']="н", ['o']="о", ['p']="п", ['r']="р", ['s']="с", ['t']="т",
        ['u']="у", ['f']="ф", ['h']="х", ['c']="ц"
    };

    private static readonly Dictionary<char, string> CyrillicToLatin = new()
    {
        ['а']="a", ['б']="b", ['в']="v", ['г']="g", ['д']="d", ['ѓ']="gj",
        ['е']="e", ['ж']="zh", ['з']="z", ['ѕ']="dz", ['и']="i", ['ј']="j",
        ['к']="k", ['л']="l", ['љ']="lj", ['м']="m", ['н']="n", ['њ']="nj",
        ['о']="o", ['п']="p", ['р']="r", ['с']="s", ['т']="t", ['ќ']="kj",
        ['у']="u", ['ф']="f", ['х']="h", ['ц']="c", ['ч']="ch", ['џ']="dzh", ['ш']="sh"
    };

    public static IReadOnlyList<string> Expand(string rawSearchTerm)
    {
        var raw = CollapseWhitespace(rawSearchTerm).Trim();
        if (raw.Length == 0) return Array.Empty<string>();

        var normalized = Normalize(raw);
        var terms = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { raw, normalized };
        AddIfDifferent(terms, TransliterateLatinToCyrillic(normalized), normalized);
        AddIfDifferent(terms, TransliterateCyrillicToLatin(normalized), normalized);

        foreach (var token in normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            terms.Add(token);
            AddStemVariants(terms, token);
        }

        foreach (var group in SynonymGroups)
        {
            var normalizedAliases = group.Select(Normalize).ToArray();
            var matches = normalizedAliases.Any(alias =>
                normalized.Contains(alias, StringComparison.OrdinalIgnoreCase)
                || (normalized.IndexOf(' ') < 0 && alias.IndexOf(' ') < 0
                    && Math.Abs(normalized.Length - alias.Length) <= 2
                    && LevenshteinDistance(normalized, alias) <= 2));

            if (!matches) continue;
            foreach (var alias in group)
            {
                terms.Add(alias);
                terms.Add(Normalize(alias));
            }
        }

        return terms
            .Where(term => !string.IsNullOrWhiteSpace(term) && term.Length >= 2)
            .OrderByDescending(term => string.Equals(term, raw, StringComparison.OrdinalIgnoreCase))
            .ThenByDescending(term => string.Equals(term, normalized, StringComparison.OrdinalIgnoreCase))
            .ThenBy(term => term.Length)
            .Take(40)
            .ToArray();
    }

    public static string Normalize(string value)
    {
        var decomposed = CollapseWhitespace(value).Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var output = new StringBuilder(decomposed.Length);
        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                output.Append(character);
        }
        return output.ToString().Normalize(NormalizationForm.FormC);
    }

    private static void AddStemVariants(HashSet<string> terms, string token)
    {
        if (token.Length <= 4) return;
        foreach (var suffix in new[] { "ите", "ови", "еви", "от", "та", "то", "те", "и", "s", "es", "a", "e", "ë" })
        {
            if (token.EndsWith(suffix, StringComparison.OrdinalIgnoreCase) && token.Length - suffix.Length >= 3)
                terms.Add(token[..^suffix.Length]);
        }
    }

    private static string TransliterateLatinToCyrillic(string value)
    {
        var working = value;
        foreach (var pair in LatinToCyrillicDigraphs)
            working = working.Replace(pair.From, pair.To, StringComparison.OrdinalIgnoreCase);
        var output = new StringBuilder();
        foreach (var character in working)
            output.Append(LatinToCyrillic.TryGetValue(character, out var mapped) ? mapped : character);
        return output.ToString();
    }

    private static string TransliterateCyrillicToLatin(string value)
    {
        var output = new StringBuilder();
        foreach (var character in value)
            output.Append(CyrillicToLatin.TryGetValue(character, out var mapped) ? mapped : character);
        return output.ToString();
    }

    private static int LevenshteinDistance(string left, string right)
    {
        var previous = Enumerable.Range(0, right.Length + 1).ToArray();
        for (var i = 1; i <= left.Length; i++)
        {
            var current = new int[right.Length + 1];
            current[0] = i;
            for (var j = 1; j <= right.Length; j++)
            {
                var cost = left[i - 1] == right[j - 1] ? 0 : 1;
                current[j] = Math.Min(Math.Min(current[j - 1] + 1, previous[j] + 1), previous[j - 1] + cost);
            }
            previous = current;
        }
        return previous[right.Length];
    }

    private static void AddIfDifferent(HashSet<string> terms, string candidate, string original)
    {
        if (!string.Equals(candidate, original, StringComparison.OrdinalIgnoreCase)) terms.Add(candidate);
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    private static string CollapseWhitespace(string value) => WhitespaceRegex().Replace(value ?? string.Empty, " ");
}
