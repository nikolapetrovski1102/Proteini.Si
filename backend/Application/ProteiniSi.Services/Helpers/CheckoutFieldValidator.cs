using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using ProteiniSi.Models;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Validates registration, profile and checkout contact/address fields against the
/// database-driven Country, City and City_PostCode rules, with built-in fallbacks.
/// </summary>
public static partial class CheckoutFieldValidator
{
    public const int MaxNoteLength = 500;
    public const int MaxEmailLength = 45;

    private static readonly string[] BlockedNoteFragments =
    [
        "http", "www.", "t.me/", "script", "hack", "crack", "cheat", "telegram"
    ];

    private static readonly Dictionary<string, string> CommonEmailDomainTypos = new(StringComparer.OrdinalIgnoreCase)
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
        ["icoud.com"] = "icloud.com"
    };

    private static readonly HashSet<string> TrustedEmailDomains = new(StringComparer.OrdinalIgnoreCase)
    {
        "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "outlook.com", "hotmail.com",
        "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me",
        "protonmail.com", "zoho.com", "gmx.com", "gmx.de", "mail.com", "yandex.com",
        "t.mk", "mt.net.mk", "t-home.mk", "on.net.mk", "telekabel.com.mk", "neotel.net.mk",
        "ukim.edu.mk", "ugd.edu.mk", "uklo.edu.mk", "seeu.edu.mk", "finki.ukim.mk",
        "proteini.si", "example.com", "test.com", "localhost"
    };

    public static readonly IReadOnlyList<CountryRule> DefaultCountries =
    [
        new() { CountryId = 1,  Iso2 = "MK", NameEn = "North Macedonia",        NameMk = "Северна Македонија",   DialCode = "389", PhoneMinDigits = 8,  PhoneMaxDigits = 8,  PhonePattern = "^[2-7][0-9]{7}$", StripLeadingZero = true,  AllowPhone = true, AllowShipping = true,  SortOrder = 1  },
        new() { CountryId = 2,  Iso2 = "AL", NameEn = "Albania",                NameMk = "Албанија",             DialCode = "355", PhoneMinDigits = 8,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 10 },
        new() { CountryId = 3,  Iso2 = "RS", NameEn = "Serbia",                 NameMk = "Србија",               DialCode = "381", PhoneMinDigits = 8,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 11 },
        new() { CountryId = 4,  Iso2 = "XK", NameEn = "Kosovo",                 NameMk = "Косово",               DialCode = "383", PhoneMinDigits = 8,  PhoneMaxDigits = 8,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 12 },
        new() { CountryId = 5,  Iso2 = "BG", NameEn = "Bulgaria",               NameMk = "Бугарија",             DialCode = "359", PhoneMinDigits = 8,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 13 },
        new() { CountryId = 6,  Iso2 = "GR", NameEn = "Greece",                 NameMk = "Грција",               DialCode = "30",  PhoneMinDigits = 10, PhoneMaxDigits = 10, PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 14 },
        new() { CountryId = 7,  Iso2 = "ME", NameEn = "Montenegro",             NameMk = "Црна Гора",            DialCode = "382", PhoneMinDigits = 8,  PhoneMaxDigits = 8,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 15 },
        new() { CountryId = 8,  Iso2 = "HR", NameEn = "Croatia",                NameMk = "Хрватска",             DialCode = "385", PhoneMinDigits = 8,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 16 },
        new() { CountryId = 9,  Iso2 = "SI", NameEn = "Slovenia",               NameMk = "Словенија",            DialCode = "386", PhoneMinDigits = 8,  PhoneMaxDigits = 8,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 17 },
        new() { CountryId = 10, Iso2 = "BA", NameEn = "Bosnia and Herzegovina", NameMk = "Босна и Херцеговина",  DialCode = "387", PhoneMinDigits = 8,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 18 },
        new() { CountryId = 11, Iso2 = "TR", NameEn = "Turkey",                 NameMk = "Турција",              DialCode = "90",  PhoneMinDigits = 10, PhoneMaxDigits = 10, PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 19 },
        new() { CountryId = 12, Iso2 = "DE", NameEn = "Germany",                NameMk = "Германија",            DialCode = "49",  PhoneMinDigits = 10, PhoneMaxDigits = 11, PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 20 },
        new() { CountryId = 13, Iso2 = "AT", NameEn = "Austria",                NameMk = "Австрија",             DialCode = "43",  PhoneMinDigits = 10, PhoneMaxDigits = 13, PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 21 },
        new() { CountryId = 14, Iso2 = "CH", NameEn = "Switzerland",            NameMk = "Швајцарија",           DialCode = "41",  PhoneMinDigits = 9,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 22 },
        new() { CountryId = 15, Iso2 = "IT", NameEn = "Italy",                  NameMk = "Италија",              DialCode = "39",  PhoneMinDigits = 9,  PhoneMaxDigits = 11, PhonePattern = null,              StripLeadingZero = false, AllowPhone = true, AllowShipping = false, SortOrder = 23 },
        new() { CountryId = 16, Iso2 = "SE", NameEn = "Sweden",                 NameMk = "Шведска",              DialCode = "46",  PhoneMinDigits = 9,  PhoneMaxDigits = 9,  PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 24 },
        new() { CountryId = 17, Iso2 = "GB", NameEn = "United Kingdom",         NameMk = "Велика Британија",     DialCode = "44",  PhoneMinDigits = 10, PhoneMaxDigits = 10, PhonePattern = null,              StripLeadingZero = true,  AllowPhone = true, AllowShipping = false, SortOrder = 25 },
        new() { CountryId = 18, Iso2 = "US", NameEn = "United States",          NameMk = "САД",                  DialCode = "1",   PhoneMinDigits = 10, PhoneMaxDigits = 10, PhonePattern = null,              StripLeadingZero = false, AllowPhone = true, AllowShipping = false, SortOrder = 26 }
    ];

    /// <summary>
    /// Returns the number in national form (e.g. 070123456) or null when it is not a
    /// Macedonian mobile or landline. Accepts +389 / 00389 / 389 prefixes, a missing
    /// leading zero, and spaces, dashes, dots, slashes and brackets.
    /// </summary>
    public static string? NormalizeMacedonianPhone(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return null;

        var trimmed = input.Trim();
        if (!AllowedPhoneCharacters().IsMatch(trimmed))
            return null;

        var digits = new string(trimmed.Where(char.IsAsciiDigit).ToArray());

        if (digits.StartsWith("00389"))
            digits = "0" + digits[5..];
        else if (digits.StartsWith("389") && digits.Length == 11)
            digits = "0" + digits[3..];
        else if (digits.Length == 8 && digits[0] is >= '2' and <= '7')
            digits = "0" + digits;

        return NationalPhone().IsMatch(digits) ? digits : null;
    }

    /// <summary>
    /// Normalizes a phone number into E.164 format (+{DialCode}{NationalDigits}, e.g. +38971000000)
    /// according to the allowed CountryRule records. Strips leading '0' when StripLeadingZero is true.
    /// </summary>
    public static string? NormalizePhone(
        string? input,
        IReadOnlyList<CountryRule>? countries = null,
        string? defaultIso2 = "MK")
    {
        if (string.IsNullOrWhiteSpace(input))
            return null;

        var trimmed = input.Trim();
        if (!AllowedPhoneCharacters().IsMatch(trimmed))
            return null;

        var activeCountries = (countries is { Count: > 0 } ? countries : DefaultCountries)
            .Where(c => c.AllowPhone)
            .OrderByDescending(c => c.DialCode.Length)
            .ToList();

        if (activeCountries.Count == 0)
            return null;

        var digits = new string(trimmed.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length == 0)
            return null;

        bool hasExplicitInternationalPrefix = trimmed.StartsWith('+') || digits.StartsWith("00");
        if (digits.StartsWith("00"))
            digits = digits[2..];

        CountryRule? matchedCountry = null;
        string national;

        if (hasExplicitInternationalPrefix)
        {
            matchedCountry = activeCountries.FirstOrDefault(c =>
                !string.IsNullOrEmpty(c.DialCode) && digits.StartsWith(c.DialCode, StringComparison.Ordinal));
            if (matchedCountry == null)
                return null;

            national = digits[matchedCountry.DialCode.Length..];
        }
        else
        {
            matchedCountry = activeCountries.FirstOrDefault(c =>
                string.Equals(c.Iso2, defaultIso2 ?? "MK", StringComparison.OrdinalIgnoreCase))
                ?? activeCountries[0];

            // Handle bare dial code without '+' (e.g. "38971000000" or "389071000000")
            if (digits.StartsWith(matchedCountry.DialCode, StringComparison.Ordinal)
                && digits.Length - matchedCountry.DialCode.Length >= matchedCountry.PhoneMinDigits)
            {
                national = digits[matchedCountry.DialCode.Length..];
            }
            else
            {
                national = digits;
            }
        }

        if (matchedCountry.StripLeadingZero && national.StartsWith('0'))
            national = national[1..];

        if (national.Length < matchedCountry.PhoneMinDigits || national.Length > matchedCountry.PhoneMaxDigits)
            return null;

        if (!national.All(char.IsAsciiDigit))
            return null;

        // Reject numbers where all national digits are identical (e.g. 00000000, 11111111)
        if (national.Distinct().Count() == 1)
            return null;

        if (!string.IsNullOrWhiteSpace(matchedCountry.PhonePattern)
            && !Regex.IsMatch(national, matchedCountry.PhonePattern))
        {
            return null;
        }

        return $"+{matchedCountry.DialCode}{national}";
    }

    /// <summary>Macedonian post codes are four digits between 1000 and 7999.</summary>
    public static bool IsValidPostCode(string? input)
    {
        var value = input?.Trim();
        return value is { Length: 4 }
            && value.All(char.IsAsciiDigit)
            && value[0] is >= '1' and <= '7';
    }

    /// <summary>
    /// Validates that the country is an allowed shipping country (North Macedonia) and returns its canonical name.
    /// </summary>
    public static string? NormalizeShippingCountry(string? countryInput, IReadOnlyList<CountryRule>? countries = null)
    {
        var trimmed = countryInput?.Trim();
        if (string.IsNullOrEmpty(trimmed))
            return "North Macedonia";

        var shippingCountries = (countries is { Count: > 0 } ? countries : DefaultCountries)
            .Where(c => c.AllowShipping)
            .ToList();

        foreach (var c in shippingCountries)
        {
            if (string.Equals(trimmed, c.Iso2, StringComparison.OrdinalIgnoreCase)
                || string.Equals(trimmed, c.NameEn, StringComparison.OrdinalIgnoreCase)
                || string.Equals(trimmed, c.NameMk, StringComparison.OrdinalIgnoreCase))
            {
                return c.NameEn;
            }
        }

        if (trimmed.Equals("Macedonia", StringComparison.OrdinalIgnoreCase)
            || trimmed.Equals("Македонија", StringComparison.OrdinalIgnoreCase)
            || trimmed.Equals("Република Северна Македонија", StringComparison.OrdinalIgnoreCase)
            || trimmed.Equals("Republic of North Macedonia", StringComparison.OrdinalIgnoreCase)
            || trimmed.Equals("Maqedonia e Veriut", StringComparison.OrdinalIgnoreCase)
            || trimmed.Equals("Maqedoni", StringComparison.OrdinalIgnoreCase))
        {
            return "North Macedonia";
        }

        return null;
    }

    /// <summary>
    /// Validates a city and post code against the database City and City_PostCode tables.
    /// Ensures the city has Deliver = true and the post code belongs to that city.
    /// </summary>
    public static (bool IsValid, string? CanonicalCity, string? CanonicalPostCode, string? ErrorMessage) ValidateCityAndPostCode(
        string? cityInput,
        string? postCodeInput,
        IReadOnlyList<CityLookup>? cities)
    {
        var cityTrimmed = cityInput?.Trim() ?? string.Empty;
        var postCodeTrimmed = postCodeInput?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(cityTrimmed))
            return (false, null, null, "Please select a valid city in North Macedonia.");

        if (!IsValidPostCode(postCodeTrimmed))
            return (false, null, null, "Please enter a valid 4-digit Macedonian post code (e.g. 1000).");

        if (cities is not { Count: > 0 })
            return (true, cityTrimmed, postCodeTrimmed, null);

        var normalizedInput = NormalizeCityKey(cityTrimmed);
        var matched = cities.FirstOrDefault(c =>
            string.Equals(c.NameLatin, cityTrimmed, StringComparison.OrdinalIgnoreCase)
            || (!string.IsNullOrWhiteSpace(c.NameMk) && string.Equals(c.NameMk, cityTrimmed, StringComparison.OrdinalIgnoreCase))
            || NormalizeCityKey(c.NameLatin) == normalizedInput);

        // If user entered a post office name or variant, fall back to matching by post code if unambiguous
        if (matched == null)
        {
            var byPostCode = cities.Where(c => c.PostCodes.Any(p => string.Equals(p.PostCode, postCodeTrimmed, StringComparison.OrdinalIgnoreCase))).ToList();
            if (byPostCode.Count == 1 && normalizedInput.Contains(NormalizeCityKey(byPostCode[0].NameLatin), StringComparison.Ordinal))
            {
                matched = byPostCode[0];
            }
        }

        if (matched == null)
            return (false, null, null, "Please select a valid city from the North Macedonia delivery list.");

        if (!matched.Deliver)
            return (false, null, null, $"Delivery is currently not available for {matched.NameLatin}.");

        if (matched.PostCodes.Count > 0
            && !matched.PostCodes.Any(p => string.Equals(p.PostCode, postCodeTrimmed, StringComparison.OrdinalIgnoreCase)))
        {
            var validList = string.Join(", ", matched.PostCodes.Select(p => p.PostCode));
            return (false, null, null, $"Post code {postCodeTrimmed} does not match {matched.NameLatin} (valid: {validList}).");
        }

        return (true, matched.NameLatin, postCodeTrimmed, null);
    }

    /// <summary>
    /// Validates email syntax, column length constraint (45 chars), and common domain typos.
    /// </summary>
    public static (bool IsValid, string? NormalizedEmail, string? ErrorMessage, string? SuggestedEmail) ValidateEmail(
        string? email,
        int maxLength = MaxEmailLength)
    {
        var trimmed = email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(trimmed))
            return (false, null, "Please provide a valid email address (e.g., name@example.com).", null);

        if (trimmed.Length > maxLength)
            return (false, null, $"Email address can be at most {maxLength} characters.", null);

        if (!EmailPattern().IsMatch(trimmed) || trimmed.Contains("..", StringComparison.Ordinal))
            return (false, null, "Please provide a valid email address (e.g., name@example.com).", null);

        var atIndex = trimmed.IndexOf('@');
        var localPart = trimmed[..atIndex];
        var domainPart = trimmed[(atIndex + 1)..];

        if (localPart.StartsWith('.') || localPart.EndsWith('.')
            || domainPart.StartsWith('.') || domainPart.EndsWith('.')
            || domainPart.StartsWith('-') || domainPart.EndsWith('-'))
        {
            return (false, null, "Please provide a valid email address (e.g., name@example.com).", null);
        }

        if (CommonEmailDomainTypos.TryGetValue(domainPart, out var correctedDomain))
        {
            var suggested = $"{localPart}@{correctedDomain}";
            return (false, null, $"Invalid email domain '@{domainPart}'. Did you mean {suggested}?", suggested);
        }

        return (true, trimmed, null, null);
    }

    /// <summary>
    /// Non-blocking DNS check for the email domain. Rejects only when DNS explicitly reports
    /// HostNotFound (NXDOMAIN). Fails open if DNS times out or is unreachable.
    /// </summary>
    public static async Task<string?> ValidateEmailDomainAsync(string email, CancellationToken cancellationToken = default)
    {
        var atIndex = email.LastIndexOf('@');
        if (atIndex < 0 || atIndex == email.Length - 1)
            return "Please provide a valid email address.";

        var domain = email[(atIndex + 1)..].Trim().ToLowerInvariant();
        if (TrustedEmailDomains.Contains(domain))
            return null;

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromMilliseconds(1500));
            var addresses = await Dns.GetHostAddressesAsync(domain, cts.Token);
            return addresses.Length > 0 ? null : $"The email domain '@{domain}' cannot receive emails.";
        }
        catch (SocketException ex) when (ex.SocketErrorCode == SocketError.HostNotFound)
        {
            return $"The email domain '@{domain}' does not exist. Please check your email address.";
        }
        catch
        {
            // Fail open on transient DNS timeouts or offline test environments
            return null;
        }
    }

    /// <summary>Null when the note is acceptable, otherwise the reason it is rejected.</summary>
    public static string? CheckNote(string? note)
    {
        if (string.IsNullOrWhiteSpace(note))
            return null;

        if (note.Length > MaxNoteLength)
            return $"The order note can be at most {MaxNoteLength} characters.";

        var lower = note.ToLowerInvariant();
        return BlockedNoteFragments.Any(lower.Contains)
            ? "The order note cannot contain links or advertising."
            : null;
    }

    private static string NormalizeCityKey(string value)
    {
        var decomposed = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var ch in decomposed)
        {
            var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category != System.Globalization.UnicodeCategory.NonSpacingMark && (char.IsLetterOrDigit(ch) || ch == ' '))
                sb.Append(ch);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }

    [GeneratedRegex(@"^\+?[0-9\s\-./()]+$")]
    private static partial Regex AllowedPhoneCharacters();

    // 0 + area/mobile prefix 2 to 7 + seven digits: 02 xxx xxxx, 03x xxx xxx, 07x xxx xxx …
    [GeneratedRegex(@"^0[2-7][0-9]{7}$")]
    private static partial Regex NationalPhone();

    [GeneratedRegex(@"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,15}$")]
    private static partial Regex EmailPattern();
}
