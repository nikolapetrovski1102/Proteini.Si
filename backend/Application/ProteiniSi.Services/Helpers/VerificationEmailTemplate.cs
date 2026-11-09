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

    public static (string Subject, string Html) Build(string? name, string code, int validMinutes, string? language)
    {
        var copy = string.Equals(language, "al", StringComparison.OrdinalIgnoreCase) ? Albanian : Macedonian;
        var displayName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(name) ? "" : name.Trim());
        var greeting = string.IsNullOrEmpty(displayName) ? copy.Greeting.Replace(" {0}", "") : string.Format(copy.Greeting, displayName);
        var spacedCode = string.Join("&#8202;", code.ToCharArray());

        var html = $@"<!DOCTYPE html>
<html>
<body style='margin:0; padding:0; background:#f6f5f1; font-family:Arial, Helvetica, sans-serif; color:#141409;'>
  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background:#f6f5f1; padding:32px 12px;'>
    <tr>
      <td align='center'>
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='max-width:520px; background:#ffffff; border-radius:16px; overflow:hidden; border-bottom:4px solid #FDC700;'>
          <tr>
            <td style='padding:28px 32px 8px 32px;'>
              <img src='https://proteini.mk/logos/proteini-invoice-logo.png' width='180' alt='Proteini.si' style='display:block; border:0; max-width:180px; height:auto;'>
            </td>
          </tr>
          <tr>
            <td style='padding:16px 32px 0 32px;'>
              <h1 style='margin:0; font-size:26px; line-height:30px; font-weight:800; text-transform:uppercase; letter-spacing:-0.3px;'>{WebUtility.HtmlEncode(copy.Heading)}</h1>
              <p style='margin:18px 0 0 0; font-size:15px; line-height:22px;'>{greeting}</p>
              <p style='margin:8px 0 0 0; font-size:15px; line-height:22px; color:#4b4b45;'>{WebUtility.HtmlEncode(copy.Intro)}</p>
            </td>
          </tr>
          <tr>
            <td align='center' style='padding:26px 32px;'>
              <div style='display:inline-block; background:#141409; color:#FDC700; border-radius:14px; padding:18px 28px; font-size:36px; line-height:40px; font-weight:800; letter-spacing:10px; font-family:""Courier New"", Courier, monospace;'>{spacedCode}</div>
              <p style='margin:14px 0 0 0; font-size:13px; line-height:18px; color:#6b6b63;'>{WebUtility.HtmlEncode(string.Format(copy.Expiry, validMinutes))}</p>
            </td>
          </tr>
          <tr>
            <td style='padding:0 32px 28px 32px;'>
              <p style='margin:0; font-size:13px; line-height:19px; color:#6b6b63;'>{WebUtility.HtmlEncode(copy.Ignore)}</p>
            </td>
          </tr>
          <tr>
            <td style='padding:16px 32px; background:#141409; color:#bdbdb3; font-size:12px; line-height:16px;'>{WebUtility.HtmlEncode(copy.Footer)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

        return ($"{copy.Subject}: {code}", html);
    }
}
