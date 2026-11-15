using System.Net;
using System.Text;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Shared shell and building blocks for every transactional email, so they all carry the
/// Proteini.si banner and the site palette (ink #141409, yellow #FDC700, warm paper #f6f5f1).
/// Everything is table-based with inline styles because most mail clients ignore stylesheets.
/// </summary>
public static class EmailLayout
{
    public const string DefaultSiteUrl = "https://proteini.mk";

    /// <summary>
    /// Public site the emails link to and load their images from (banner, badge strokes).
    /// Set once at startup from AppSettings:FrontendUrl so stage mails use stage.proteini.mk and
    /// prod mails use proteini.mk. Local/dev URLs are ignored: mail clients cannot reach them.
    /// </summary>
    public static string SiteUrl { get; private set; } = DefaultSiteUrl;
    /// <summary>Bump when an email image changes: Gmail's image proxy caches each URL (including a failed fetch).</summary>
    public const string AssetVersion = "2";
    public static string BannerUrl => AssetUrl("proteini-banner.png");
    public static string AssetUrl(string file) => $"{SiteUrl}/img/email/{file}?v={AssetVersion}";

    public static void Configure(string? siteUrl)
    {
        if (Uri.TryCreate(siteUrl?.Trim(), UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && !uri.IsLoopback
            && !uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
            SiteUrl = uri.GetLeftPart(UriPartial.Path).TrimEnd('/');
    }

    public const string Ink = "#141409";
    public const string Yellow = "#FDC700";
    public const string Paper = "#f6f5f1";
    public const string Line = "#e7e4da";
    public const string Muted = "#6b6b63";
    public const string Body = "#3a3a32";

    public const string DisplayFont = "Oswald, Arial Narrow, Arial, Helvetica, sans-serif";
    public const string TextFont = "Montserrat, Arial, Helvetica, sans-serif";

    public enum Tone { Yellow, Ink }

    /// <summary>Wraps the content rows (each a &lt;tr&gt;) in the branded page.</summary>
    public static string Page(string title, string preheader, string rows, string? footerNote = null, string? locationLine = null, int width = 600, string? unsubscribeHtml = null, string? language = null)
    {
        var unsubscribe = string.IsNullOrWhiteSpace(unsubscribeHtml)
            ? ""
            : $"<p style='margin:8px 0 0 0; font-size:11px; line-height:16px; color:#9a9a90;'>{unsubscribeHtml}</p>";

        var note = string.IsNullOrWhiteSpace(footerNote)
            ? ""
            : $"<p style='margin:10px 0 0 0; font-size:11px; line-height:16px; color:#8a8a80;'>{Encode(footerNote)}</p>";

        return $@"<!DOCTYPE html>
<html lang='{(EmailLanguage.IsAlbanian(language) ? "sq" : "mk")}'>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <meta name='color-scheme' content='light only'>
  <meta name='supported-color-schemes' content='light only'>
  <title>{Encode(title)}</title>
  <link href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Oswald:wght@500;700&display=swap' rel='stylesheet'>
  <style>
    /* The mails always use the light Proteini palette (paper, white, ink, yellow), also when the
       phone is in dark mode. color-scheme light only stops Apple Mail / iOS from darkening the mail; the
       rules below re-assert the colours for clients that apply their own dark styles anyway. */
    :root {{ color-scheme: light only; supported-color-schemes: light only; }}
    body, .ps-paper {{ background:{Paper} !important; }}
    @media (prefers-color-scheme: dark) {{
      body, .ps-paper {{ background:{Paper} !important; background-color:{Paper} !important; }}
      .ps-white {{ background:#ffffff !important; background-color:#ffffff !important; }}
      .ps-panel {{ background:{Paper} !important; background-color:{Paper} !important; }}
      .ps-ink-bg {{ background:{Ink} !important; background-color:{Ink} !important; }}
      .ps-yellow-bg {{ background:{Yellow} !important; background-color:{Yellow} !important; }}
      .ps-callout {{ background:#fffbea !important; background-color:#fffbea !important; border-color:{Yellow} !important; }}
      .ps-ink, .ps-ink a {{ color:{Ink} !important; }}
      .ps-body {{ color:{Body} !important; }}
      .ps-muted {{ color:{Muted} !important; }}
      .ps-on-ink {{ color:#ffffff !important; }}
      .ps-soft {{ color:#bdbdb3 !important; }}
      .ps-yellow {{ color:{Yellow} !important; }}
    }}
    /* Outlook.com / Outlook apps mark the elements they recolour with data-ogsc / data-ogsb. */
    [data-ogsb] .ps-paper {{ background-color:{Paper} !important; }}
    [data-ogsb] .ps-white {{ background-color:#ffffff !important; }}
    [data-ogsb] .ps-panel {{ background-color:{Paper} !important; }}
    [data-ogsb] .ps-ink-bg {{ background-color:{Ink} !important; }}
    [data-ogsb] .ps-yellow-bg {{ background-color:{Yellow} !important; }}
    [data-ogsb] .ps-callout {{ background-color:#fffbea !important; }}
    [data-ogsc] .ps-ink, [data-ogsc] .ps-ink a {{ color:{Ink} !important; }}
    [data-ogsc] .ps-body {{ color:{Body} !important; }}
    [data-ogsc] .ps-muted {{ color:{Muted} !important; }}
    [data-ogsc] .ps-on-ink {{ color:#ffffff !important; }}
    [data-ogsc] .ps-soft {{ color:#bdbdb3 !important; }}
    [data-ogsc] .ps-yellow {{ color:{Yellow} !important; }}
    @media only screen and (max-width:620px) {{
      .px {{ padding-left:20px !important; padding-right:20px !important; }}
      .stack {{ display:block !important; width:100% !important; box-sizing:border-box; border-right:0 !important; }}
      .stack-gap {{ padding:0 0 14px 0 !important; }}
      .h1 {{ font-size:26px !important; line-height:30px !important; }}
      .hide-sm {{ display:none !important; }}
      .outer {{ padding:16px 8px !important; }}
      .code-box {{ padding:20px 8px 18px 8px !important; }}
      .code {{ font-size:28px !important; line-height:34px !important; letter-spacing:6px !important; padding:12px 10px 12px 16px !important; }}
      .total-cell {{ padding:14px 14px !important; }}
      .total-value {{ font-size:19px !important; line-height:24px !important; }}
    }}
  </style>
</head>
<body class='ps-paper' style='margin:0; padding:0; background:{Paper}; font-family:{TextFont}; color:{Ink}; -webkit-text-size-adjust:100%;'>
  <div style='display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; mso-hide:all;'>{Encode(preheader)}</div>
  <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' class='ps-paper' bgcolor='{Paper}' style='background:{Paper};'>
    <tr>
      <td class='outer' align='center' style='padding:28px 12px;'>
        <table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' class='ps-white' bgcolor='#ffffff' style='max-width:{width}px; background:#ffffff; border-collapse:separate; border-radius:16px; overflow:hidden;'>
          <tr>
            <td align='center' class='ps-ink-bg' bgcolor='{Ink}' style='background:{Ink}; padding:0; line-height:0; font-size:0;'>
              <a href='{SiteUrl}' target='_blank' style='display:block; text-decoration:none;'>
                <img src='{BannerUrl}' width='{width}' height='{width * 220 / 1200}' alt='Proteini.si Sport Nutrition Center' style='display:block; width:100%; max-width:{width}px; height:auto; border:0; color:#ffffff; font-family:{DisplayFont}; font-size:22px; line-height:110px;'>
              </a>
            </td>
          </tr>
          <tr><td height='5' class='ps-yellow-bg' bgcolor='{Yellow}' style='background:{Yellow}; height:5px; line-height:5px; font-size:0;'>&nbsp;</td></tr>
{rows}
          <tr>
            <td class='px ps-ink-bg' bgcolor='{Ink}' style='background:{Ink}; padding:26px 36px; text-align:center;'>
              <p style='margin:0; font-family:{DisplayFont}; font-size:15px; line-height:20px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#ffffff;' class='ps-on-ink'>Proteini<span class='ps-yellow' style='color:{Yellow};'>.si</span></p>
              <p class='ps-soft' style='margin:8px 0 0 0; font-size:12px; line-height:19px; color:#bdbdb3;'>
                <a href='{SiteUrl}' target='_blank' class='ps-soft' style='color:#bdbdb3; text-decoration:none;'>proteini.mk</a>
                &nbsp;·&nbsp; <a href='mailto:info@proteini.mk' class='ps-soft' style='color:#bdbdb3; text-decoration:none;'>info@proteini.mk</a>
                &nbsp;·&nbsp; <a href='tel:+38971399036' class='ps-soft' style='color:#bdbdb3; text-decoration:none;'>+389 71 399 036</a>
              </p>
              {note}
            </td>
          </tr>
        </table>
        <p style='margin:14px 0 0 0; font-size:11px; line-height:16px; color:#9a9a90;'>&copy; {DateTime.Now.Year} {Encode(locationLine ?? "Proteini.si · Скопје, Македонија")}</p>
        {unsubscribe}
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    /// <summary>A content row with the standard side padding.</summary>
    public static string Row(string innerHtml, string padding = "0 36px 24px 36px") =>
        $"          <tr><td class='px' style='padding:{padding};'>{innerHtml}</td></tr>\n";

    /// <summary>Opening block: status pill, big uppercase heading and intro paragraph(s).</summary>
    public static string Hero(string heading, string? badge, Tone tone, params string[] paragraphsHtml)
    {
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(badge))
            sb.Append($"<div style='margin:0 0 14px 0;'>{Badge(badge, tone)}</div>");
        sb.Append($"<h1 class='h1 ps-ink' style='margin:0; font-family:{DisplayFont}; font-size:32px; line-height:36px; font-weight:700; text-transform:uppercase; letter-spacing:0.2px; color:{Ink};'>{Encode(heading)}</h1>");
        foreach (var p in paragraphsHtml)
            sb.Append($"<p class='ps-body' style='margin:14px 0 0 0; font-size:15px; line-height:24px; color:{Body};'>{p}</p>");
        return Row(sb.ToString(), "34px 36px 26px 36px");
    }

    /// <summary>
    /// Status label with the brand arc underline (the brush stroke from the site's Scribble component).
    /// Mail clients block SVG, so the stroke is a PNG (yellow or black), stretched to the label's width.
    /// </summary>
    public static string Badge(string text, Tone tone)
    {
        var (arc, fg) = tone switch
        {
            Tone.Ink => ("ink", Ink),
            _ => ("yellow", Ink)
        };
        return "<table role='presentation' cellpadding='0' cellspacing='0' border='0' style='display:inline-table; border-collapse:collapse;'>" +
               $"<tr><td class='ps-ink' style='padding:0 2px; font-family:{DisplayFont}; font-size:14px; line-height:18px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:{fg}; white-space:nowrap;'>{Encode(text)}</td></tr>" +
               $"<tr><td style='padding:2px 0 0 0; line-height:0; font-size:0;'><img src='{AssetUrl($"arc-{arc}.png")}' width='100%' height='10' alt='' style='display:block; width:100%; height:10px; border:0;'></td></tr>" +
               "</table>";
    }

    public static string SectionTitle(string text) =>
        $"<h2 class='ps-ink' style='margin:0 0 12px 0; font-family:{DisplayFont}; font-size:18px; line-height:22px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:{Ink};'>{Encode(text)}</h2>";

    /// <summary>Small grey label above a bold value.</summary>
    public static string Field(string label, string valueHtml, bool last = false) =>
        $"<div class='ps-muted' style='font-size:11px; line-height:15px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:{Muted};'>{Encode(label)}</div>" +
        $"<div class='ps-ink' style='margin:2px 0 {(last ? 0 : 12)}px 0; font-size:14px; line-height:20px; font-weight:700; color:{Ink}; word-break:break-word; overflow-wrap:anywhere;'>{valueHtml}</div>";

    /// <summary>A rounded paper-coloured panel; cells are laid out as columns that stack on mobile.</summary>
    public static string Panel(params string[] columnsHtml)
    {
        var width = 100 / Math.Max(1, columnsHtml.Length);
        var sb = new StringBuilder();
        sb.Append($"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' class='ps-panel' bgcolor='{Paper}' style='background:{Paper}; border-radius:12px;'><tr>");
        for (var i = 0; i < columnsHtml.Length; i++)
        {
            var divider = i < columnsHtml.Length - 1 ? $" border-right:1px solid {Line};" : "";
            sb.Append($"<td class='stack' width='{width}%' style='padding:18px 18px 16px 18px; vertical-align:top;{divider}'>{columnsHtml[i]}</td>");
        }
        sb.Append("</tr></table>");
        return sb.ToString();
    }

    public static string Button(string href, string text) =>
        $"<table role='presentation' cellpadding='0' cellspacing='0' border='0'><tr><td class='ps-yellow-bg' bgcolor='{Yellow}' style='background:{Yellow}; border-radius:999px;'>" +
        $"<a href='{Encode(href)}' target='_blank' class='ps-ink' style='display:inline-block; padding:14px 28px; font-family:{DisplayFont}; font-size:15px; line-height:18px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:{Ink}; text-decoration:none;'>{Encode(text)}</a>" +
        "</td></tr></table>";

    public static string Note(string html, string margin = "0") =>
        $"<p class='ps-muted' style='margin:{margin}; font-size:13px; line-height:20px; color:{Muted};'>{html}</p>";

    /// <summary>Item table. Each column has a header, an alignment ("left"/"center"/"right") and can be hidden on phones.
    /// The last column is bold; columns flagged as muted render in grey (e.g. SKU).</summary>
    public static string ItemsTable(IReadOnlyList<(string Header, string Align, bool HideOnMobile, bool Muted)> columns, IEnumerable<string[]> rows)
    {
        string Classes(int i, string colorClass) => $" class='{(columns[i].HideOnMobile ? "hide-sm " : "")}{colorClass}'";

        var sb = new StringBuilder();
        sb.Append("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='border-collapse:collapse;'><tr>");
        for (var i = 0; i < columns.Count; i++)
            sb.Append($"<th{Classes(i, "ps-ink")} align='{columns[i].Align}' style='padding:0 8px 10px 8px; border-bottom:2px solid {Ink}; font-family:{DisplayFont}; font-size:12px; line-height:16px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:{Ink}; text-align:{columns[i].Align};'>{Encode(columns[i].Header)}</th>");
        sb.Append("</tr>");
        foreach (var row in rows)
        {
            sb.Append("<tr>");
            for (var i = 0; i < columns.Count && i < row.Length; i++)
            {
                var weight = i == columns.Count - 1 ? " font-weight:700; white-space:nowrap;" : "";
                var color = columns[i].Muted ? Muted : Ink;
                var colorClass = columns[i].Muted ? "ps-muted" : "ps-ink";
                sb.Append($"<td{Classes(i, colorClass)} align='{columns[i].Align}' style='padding:13px 8px; border-bottom:1px solid {Line}; font-size:14px; line-height:20px; color:{color}; text-align:{columns[i].Align}; vertical-align:top;{(columns[i].Align == "right" ? " white-space:nowrap;" : " word-break:break-word;")}{weight}'>{row[i]}</td>");
            }
            sb.Append("</tr>");
        }
        sb.Append("</table>");
        return sb.ToString();
    }

    /// <summary>Totals block; the final line is shown as the large ink "total" bar.</summary>
    public static string Totals(IEnumerable<(string Label, string Value, string? Note)> lines, string totalLabel, string totalValue)
    {
        var sb = new StringBuilder();
        sb.Append("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='border-collapse:collapse;'>");
        foreach (var (label, value, note) in lines)
        {
            sb.Append($"<tr><td class='ps-body' style='padding:6px 8px; font-size:14px; line-height:20px; color:{Body};'>{label}");
            if (!string.IsNullOrWhiteSpace(note))
                sb.Append($"<div class='ps-muted' style='font-size:12px; line-height:17px; color:{Muted};'>{note}</div>");
            sb.Append($"</td><td align='right' class='ps-ink' style='padding:6px 8px; font-size:14px; line-height:20px; color:{Ink}; white-space:nowrap; vertical-align:top;'>{value}</td></tr>");
        }
        sb.Append("</table>");
        sb.Append($"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' class='ps-ink-bg' bgcolor='{Ink}' style='margin-top:12px; background:{Ink}; border-radius:12px;'><tr>" +
                  $"<td class='total-cell ps-on-ink' style='padding:16px 18px; font-family:{DisplayFont}; font-size:15px; line-height:20px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#ffffff;'>{Encode(totalLabel)}</td>" +
                  $"<td class='total-cell total-value ps-yellow' align='right' style='padding:16px 18px; font-family:{DisplayFont}; font-size:22px; line-height:26px; font-weight:700; color:{Yellow}; white-space:nowrap;'>{totalValue}</td>" +
                  "</tr></table>");
        return sb.ToString();
    }

    /// <summary>Yellow-edged callout box (vouchers, tracking, notices).</summary>
    public static string Callout(string innerHtml) =>
        $"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' class='ps-callout' bgcolor='#fffbea' style='background:#fffbea; border:2px solid {Yellow}; border-radius:12px;'><tr><td style='padding:18px 20px;'>{innerHtml}</td></tr></table>";

    public static string Encode(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
}
