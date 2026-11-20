namespace ProteiniSi.Services.Helpers;

/// <summary>
/// "Did you mean …?" for mistyped email domains (hotmal.com → hotmail.com).
/// Same lists and rules as frontend/src/utils/emailSuggestions.js; keep them in sync.
/// </summary>
public static class EmailSuggestions
{
    /// <summary>Most used first: on a tie the earlier domain wins.</summary>
    public static readonly string[] KnownDomains =
    [
        // Global
        "gmail.com", "googlemail.com",
        "hotmail.com", "outlook.com", "live.com", "msn.com", "windowslive.com",
        "yahoo.com", "ymail.com", "rocketmail.com",
        "icloud.com", "me.com", "mac.com",
        "aol.com", "proton.me", "protonmail.com", "pm.me",
        "gmx.com", "gmx.net", "gmx.de", "gmx.at", "gmx.ch", "mail.com",
        "yandex.com", "yandex.ru", "mail.ru", "zoho.com", "tutanota.com", "tuta.io",
        "fastmail.com", "hey.com", "inbox.com", "email.com", "usa.com", "post.com",
        // Country versions of the big providers
        "hotmail.co.uk", "hotmail.de", "hotmail.fr", "hotmail.it", "hotmail.es", "hotmail.rs", "hotmail.com.tr",
        "outlook.de", "outlook.fr", "outlook.it", "outlook.es", "outlook.co.uk",
        "live.co.uk", "live.de", "live.fr", "live.it", "live.nl", "live.at", "live.se",
        "yahoo.co.uk", "yahoo.de", "yahoo.fr", "yahoo.it", "yahoo.es", "yahoo.gr", "yahoo.ca", "yahoo.com.au",
        // Europe / region
        "web.de", "t-online.de", "freenet.de", "arcor.de", "bluewin.ch", "libero.it", "virgilio.it", "tiscali.it",
        "orange.fr", "free.fr", "wanadoo.fr", "laposte.net", "sfr.fr", "seznam.cz", "wp.pl", "o2.pl", "onet.pl",
        "interia.pl", "abv.bg", "mail.bg", "dir.bg", "otenet.gr", "sbb.rs", "eunet.rs", "siol.net", "t-com.hr",
        "net.hr", "btinternet.com", "sky.com",
        // North America
        "comcast.net", "verizon.net", "att.net", "sbcglobal.net", "cox.net", "charter.net",
        // North Macedonia
        "t-home.mk", "t.mk", "mt.net.mk", "on.net.mk", "telekabel.com.mk", "neotel.net.mk",
        "ukim.edu.mk", "ugd.edu.mk", "uklo.edu.mk", "seeu.edu.mk", "finki.ukim.mk", "students.finki.ukim.mk",
        "proteini.mk", "proteini.si"
    ];

    /// <summary>Certain typos: blocked outright at registration and checkout.</summary>
    public static readonly IReadOnlyDictionary<string, string> KnownTypos = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["gmial.com"] = "gmail.com",
        ["gamil.com"] = "gmail.com",
        ["gmai.com"] = "gmail.com",
        ["gmail.co"] = "gmail.com",
        ["gmail.con"] = "gmail.com",
        ["gnail.com"] = "gmail.com",
        ["gmal.com"] = "gmail.com",
        ["yaho.com"] = "yahoo.com",
        ["yahooo.com"] = "yahoo.com",
        ["yahoo.co"] = "yahoo.com",
        ["yahoo.con"] = "yahoo.com",
        ["hotmial.com"] = "hotmail.com",
        ["hotmal.com"] = "hotmail.com",
        ["hotmail.co"] = "hotmail.com",
        ["hotmail.con"] = "hotmail.com",
        ["outlok.com"] = "outlook.com",
        ["outllok.com"] = "outlook.com",
        ["outlook.co"] = "outlook.com",
        ["iclod.com"] = "icloud.com",
        ["icoud.com"] = "icloud.com",
        ["g.mail.com"] = "gmail.com",
        ["gmail.mk"] = "gmail.com",
        ["hotmail.mk"] = "hotmail.com",
        ["yahoo.mk"] = "yahoo.com",
        ["outlook.mk"] = "outlook.com",
        ["gmail.com.mk"] = "gmail.com",
        ["hotmail.com.mk"] = "hotmail.com",
        ["thome.mk"] = "t-home.mk",
        ["t-home.com"] = "t-home.mk",
        ["t-home.com.mk"] = "t-home.mk"
    };

    /// <summary>Providers whose address almost always ends in .com (gmail.ru → gmail.com).</summary>
    private static readonly string[] ComProviders =
        ["gmail", "googlemail", "hotmail", "outlook", "yahoo", "ymail", "icloud", "protonmail", "aol"];

    private static readonly HashSet<string> Known = new(KnownDomains, StringComparer.OrdinalIgnoreCase);

    private static readonly Dictionary<string, string> WithoutDots = KnownDomains
        .Reverse()
        .GroupBy(Squash)
        .ToDictionary(group => group.Key, group => group.Last());

    public static bool IsKnownDomain(string domain) => Known.Contains(domain);

    /// <summary>The corrected domain, or null when it looks fine or nothing is close.</summary>
    public static string? SuggestDomain(string? rawDomain)
    {
        var domain = (rawDomain ?? string.Empty).Trim().ToLowerInvariant().TrimEnd('.');
        if (domain.Length == 0 || Known.Contains(domain))
            return null;
        if (KnownTypos.TryGetValue(domain, out var typo))
            return typo;

        var provider = ComProviders.FirstOrDefault(name => domain.StartsWith(name + ".", StringComparison.Ordinal));
        if (provider != null)
            return provider + ".com";

        if (WithoutDots.TryGetValue(Squash(domain), out var squashed))
            return squashed;

        // Short domains (o2.pl, wp.pl) are one key apart from each other: two mistakes only on longer ones.
        var limit = domain.Length >= 9 ? 2 : 1;
        string? best = null;
        var bestDistance = limit + 1;
        foreach (var known in KnownDomains)
        {
            var distance = EditDistance(domain, known, limit);
            if (distance < bestDistance)
            {
                best = known;
                bestDistance = distance;
                if (distance == 1)
                    break;
            }
        }

        return best;
    }

    /// <summary>The whole corrected address (name@hotmail.com), or null.</summary>
    public static string? SuggestEmail(string? email)
    {
        var trimmed = (email ?? string.Empty).Trim().ToLowerInvariant();
        var at = trimmed.IndexOf('@');
        if (at <= 0 || at != trimmed.LastIndexOf('@') || trimmed.Length - at - 1 < 3)
            return null;

        var suggested = SuggestDomain(trimmed[(at + 1)..]);
        return suggested == null ? null : $"{trimmed[..at]}@{suggested}";
    }

    private static string Squash(string domain) => domain.Replace(".", "").Replace("-", "");

    /// <summary>Optimal string alignment distance (insert, delete, replace, swap neighbours), capped at limit + 1.</summary>
    private static int EditDistance(string a, string b, int limit)
    {
        if (Math.Abs(a.Length - b.Length) > limit)
            return limit + 1;

        var prevPrev = new int[b.Length + 1];
        var prev = new int[b.Length + 1];
        var row = new int[b.Length + 1];
        for (var j = 0; j <= b.Length; j++)
            prev[j] = j;

        for (var i = 1; i <= a.Length; i++)
        {
            row[0] = i;
            var rowMin = i;
            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                var value = Math.Min(Math.Min(prev[j] + 1, row[j - 1] + 1), prev[j - 1] + cost);
                if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1])
                    value = Math.Min(value, prevPrev[j - 2] + 1);
                row[j] = value;
                rowMin = Math.Min(rowMin, value);
            }

            if (rowMin > limit)
                return limit + 1;

            (prevPrev, prev, row) = (prev, row, prevPrev);
        }

        return prev[b.Length];
    }
}
