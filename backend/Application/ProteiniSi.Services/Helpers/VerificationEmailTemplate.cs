using System.Net;

namespace ProteiniSi.Services.Helpers;

public static class VerificationEmailTemplate
{
    private sealed record Copy(string Subject, string Heading, string Greeting, string Intro, string Expiry, string Ignore, string Footer);

    private static readonly Copy Macedonian = new(
        "Вашиот код за потврда на е-пошта",
        "Потврдете ја вашата е-пошта",
        "Здраво {0},",
        "Ви благодариме што се регистриравте на Proteini.si. Внесете го кодот подолу за да ја активирате вашата сметка.",
        "Кодот важи {0} минути.",
        "Ако не сте креирале сметка, слободно игнорирајте ја оваа порака.",
        "Proteini.si · Скопје, Македонија");

    private static readonly Copy Albanian = new(
        "Kodi juaj për konfirmimin e email-it",
        "Konfirmoni email-in tuaj",
        "Përshëndetje {0},",
        "Faleminderit që u regjistruat në Proteini.si. Shkruani kodin më poshtë për të aktivizuar llogarinë tuaj.",
        "Kodi është i vlefshëm për {0} minuta.",
        "Nëse nuk keni krijuar llogari, injorojeni këtë mesazh.",
        "Proteini.si · Shkup, Maqedoni");

    private static readonly Copy CheckoutMacedonian = Macedonian with
    {
        Subject = "Код за потврда на нарачката",
        Heading = "Потврдете ја нарачката",
        Intro = "Внесете го кодот подолу на страницата за плаќање за да ја потврдите вашата нарачка со плаќање при достава.",
        Ignore = "Ако не сте правеле нарачка на Proteini.si, слободно игнорирајте ја оваа порака."
    };

    private static readonly Copy CheckoutAlbanian = Albanian with
    {
        Subject = "Kodi për konfirmimin e porosisë",
        Heading = "Konfirmoni porosinë",
        Intro = "Shkruani kodin më poshtë në faqen e pagesës për të konfirmuar porosinë tuaj me pagesë në dorëzim.",
        Ignore = "Nëse nuk keni bërë porosi në Proteini.si, injorojeni këtë mesazh."
    };

    private static readonly Copy SignInMacedonian = Macedonian with
    {
        Subject = "Вашиот код за најава",
        Heading = "Најавете се на Proteini.si",
        Intro = "Внесете го кодот подолу за да се најавите. Ако сè уште немате сметка, ќе ја креираме веднаш.",
        Ignore = "Ако не сте побарале најава, слободно игнорирајте ја оваа порака. Никој не може да се најави без овој код."
    };

    private static readonly Copy SignInAlbanian = Albanian with
    {
        Subject = "Kodi juaj për hyrje",
        Heading = "Hyni në Proteini.si",
        Intro = "Shkruani kodin më poshtë për t'u kyçur. Nëse ende nuk keni llogari, do ta krijojmë menjëherë.",
        Ignore = "Nëse nuk keni kërkuar hyrje, injorojeni këtë mesazh. Askush nuk mund të hyjë pa këtë kod."
    };

    /// <summary>Code email for signing in (or signing up) without a password.</summary>
    public static (string Subject, string Html) BuildSignIn(string code, int validMinutes, string? language) =>
        Render(IsAlbanian(language) ? SignInAlbanian : SignInMacedonian, null, code, validMinutes);

    /// <summary>Code email for a guest confirming a cash-on-delivery order.</summary>
    public static (string Subject, string Html) BuildCheckout(string? name, string code, int validMinutes, string? language) =>
        Render(IsAlbanian(language) ? CheckoutAlbanian : CheckoutMacedonian, name, code, validMinutes);

    public static (string Subject, string Html) Build(string? name, string code, int validMinutes, string? language) =>
        Render(IsAlbanian(language) ? Albanian : Macedonian, name, code, validMinutes);

    private sealed record ResetCopy(string Subject, string Heading, string Intro, string Button, string Expiry, string Fallback, string Ignore, string Footer);

    private static readonly ResetCopy ResetMacedonian = new(
        "Промена на лозинка",
        "Поставете нова лозинка",
        "Добивме барање за промена на лозинката за вашата сметка на Proteini.si. Кликнете на копчето подолу за да поставите нова лозинка.",
        "Промени лозинка",
        "Линкот важи 1 час и може да се искористи само еднаш.",
        "Ако копчето не работи, копирајте го овој линк во прелистувачот:",
        "Ако не сте побарале промена на лозинка, слободно игнорирајте ја оваа порака. Вашата лозинка останува иста.",
        "Proteini.si · Скопје, Македонија");

    private static readonly ResetCopy ResetAlbanian = new(
        "Ndryshimi i fjalëkalimit",
        "Vendosni fjalëkalim të ri",
        "Morëm një kërkesë për ndryshimin e fjalëkalimit të llogarisë suaj në Proteini.si. Klikoni butonin më poshtë për të vendosur një fjalëkalim të ri.",
        "Ndrysho fjalëkalimin",
        "Lidhja është e vlefshme për 1 orë dhe mund të përdoret vetëm një herë.",
        "Nëse butoni nuk funksionon, kopjoni këtë lidhje në shfletues:",
        "Nëse nuk keni kërkuar ndryshim të fjalëkalimit, injorojeni këtë mesazh. Fjalëkalimi juaj mbetet i njëjtë.",
        "Proteini.si · Shkup, Maqedoni");

    /// <summary>Password reset link email.</summary>
    public static (string Subject, string Html) BuildPasswordReset(string resetUrl, string? language)
    {
        var copy = IsAlbanian(language) ? ResetAlbanian : ResetMacedonian;
        var safeUrl = WebUtility.HtmlEncode(resetUrl);

        var rows =
            EmailLayout.Hero(copy.Heading, null, EmailLayout.Tone.Yellow, WebUtility.HtmlEncode(copy.Intro)) +
            EmailLayout.Row(
                EmailLayout.Button(resetUrl, copy.Button) +
                EmailLayout.Note(WebUtility.HtmlEncode(copy.Expiry), "14px 0 0 0")) +
            EmailLayout.Row(
                EmailLayout.Note(WebUtility.HtmlEncode(copy.Fallback)) +
                $"<p style='margin:6px 0 0 0; font-size:12px; line-height:18px; word-break:break-all;'><a href='{safeUrl}' target='_blank' style='color:{EmailLayout.Ink};'>{safeUrl}</a></p>") +
            EmailLayout.Row(EmailLayout.Note(WebUtility.HtmlEncode(copy.Ignore)), "0 36px 32px 36px");

        return (copy.Subject, EmailLayout.Page(copy.Subject, copy.Intro, rows, locationLine: copy.Footer));
    }

    private static bool IsAlbanian(string? language) =>
        string.Equals(language, "al", StringComparison.OrdinalIgnoreCase);

    private static (string Subject, string Html) Render(Copy copy, string? name, string code, int validMinutes)
    {
        var displayName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(name) ? "" : name.Trim());
        var greeting = string.IsNullOrEmpty(displayName) ? copy.Greeting.Replace(" {0}", "") : string.Format(copy.Greeting, displayName);
        // No separator characters between digits: letter-spacing does the spacing, so copy/paste yields exactly the six digits.
        // Sized to fit a 320px-wide phone; the .code-box/.code rules in EmailLayout shrink it further on small screens.
        var codeBox =
            $"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background:{EmailLayout.Paper}; border-radius:14px;'><tr><td class='code-box' align='center' style='padding:26px 16px 22px 16px;'>" +
            $"<div class='code' style='display:inline-block; background:{EmailLayout.Ink}; color:{EmailLayout.Yellow}; border-radius:12px; padding:14px 14px 14px 21px; font-size:30px; line-height:36px; font-weight:700; letter-spacing:7px; white-space:nowrap; font-family:\"Courier New\", Courier, monospace;'>{WebUtility.HtmlEncode(code)}</div>" +
            $"<p style='margin:14px 0 0 0; font-size:13px; line-height:18px; color:{EmailLayout.Muted};'>{WebUtility.HtmlEncode(string.Format(copy.Expiry, validMinutes))}</p>" +
            "</td></tr></table>";

        var rows =
            EmailLayout.Hero(copy.Heading, null, EmailLayout.Tone.Yellow, greeting, WebUtility.HtmlEncode(copy.Intro)) +
            EmailLayout.Row(codeBox) +
            EmailLayout.Row(EmailLayout.Note(WebUtility.HtmlEncode(copy.Ignore)), "0 36px 32px 36px");

        var html = EmailLayout.Page(copy.Subject, $"{copy.Subject}: {code}", rows, locationLine: copy.Footer);

        return ($"{copy.Subject}: {code}", html);
    }
}
