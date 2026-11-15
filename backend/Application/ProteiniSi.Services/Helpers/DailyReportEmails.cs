using System.Globalization;
using System.Text;
using ProteiniSi.Models;
using static ProteiniSi.Services.Helpers.EmailLayout;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// HTML for the two daily emails, built from the same <see cref="EmailLayout"/> blocks as the
/// order emails so they carry the site's look (ink, yellow, warm paper, Oswald headings).
/// </summary>
public static class DailyReportEmails
{
    private const string Good = "#2e7d32";
    private const string Bad = "#b3261e";
    private static readonly CultureInfo En = CultureInfo.GetCultureInfo("en-GB");

    // ------------------------------------------------------------------------------------------
    // Business report (admins)
    // ------------------------------------------------------------------------------------------

    public static (string Subject, string Html) BuildBusiness(DateOnly date, DailyReportData data, DailyReportSummary? previous)
    {
        var s = data.Summary;
        var day = date.ToString("dddd, d MMMM yyyy", En);
        var subject = $"Daily report {date.ToString("d MMM", En)} · {s.OrdersPlaced} order{(s.OrdersPlaced == 1 ? "" : "s")}, {Money(s.Revenue)} | Proteini.mk";

        var intro = s.OrdersPlaced == 0
            ? $"No orders were placed on {Encode(day)}."
            : $"<strong>{s.OrdersPlaced}</strong> order{(s.OrdersPlaced == 1 ? " was" : "s were")} placed on {Encode(day)}, worth <strong>{Money(s.Revenue)}</strong>.";

        var rows = new StringBuilder();
        rows.Append(Hero("Daily report", date.ToString("d MMMM yyyy", En), Tone.Yellow, intro));

        rows.Append(Row(Tiles(
            Tile("Visitors", s.Visitors, previous?.Visitors, $"{s.NewVisitors} new · {s.PageViews} page views"),
            Tile("New accounts", s.NewAccounts, previous?.NewAccounts, $"{s.NewAccountsConfirmed} confirmed email"),
            Tile("Orders", s.OrdersPlaced, previous?.OrdersPlaced, $"{s.OrdersPaidOnline} card · {s.OrdersCashOnDelivery} cash"))
            + "<div style='height:12px; line-height:12px; font-size:0;'>&nbsp;</div>"
            + Tiles(
            TileText("Revenue", Money(s.Revenue), Delta(s.Revenue, previous?.Revenue, money: true), s.OrdersPlaced > 0 ? $"avg {Money(s.Revenue / Math.Max(1, s.OrdersPlaced))}" : "—"),
            Tile("Customers", s.Customers, previous?.Customers, $"{s.ReturningCustomers} returning · {s.GuestOrders} guest"),
            Tile("Newsletter", s.NewsletterSignups, previous?.NewsletterSignups, "new subscribers"))));

        // Funnel
        var funnel = new StringBuilder(SectionTitle("Shopping funnel"));
        var top = Math.Max(1, s.Visitors);
        funnel.Append(FunnelBar("Visited the website", s.Visitors, top));
        funnel.Append(FunnelBar("Added to cart", s.CartVisitors, top));
        funnel.Append(FunnelBar("Continued to checkout", s.CheckoutVisitors, top));
        funnel.Append(FunnelBar("Placed an order", s.OrderVisitors, top));
        rows.Append(Row(funnel.ToString(), "8px 36px 18px 36px"));

        rows.Append(Row(Panel(
            Field("Full cart, did not order", $"{s.CartNoCheckout} visitor{Plural(s.CartNoCheckout)}") +
                Field("Registered users with items in cart", $"{s.RegisteredOpenCarts} · {Money(s.RegisteredOpenCartsValue)}", last: true),
            Field("Went to checkout, did not order", $"{s.CheckoutNoOrder} visitor{Plural(s.CheckoutNoOrder)}") +
                Field("Card payment not completed", $"{s.CardPaymentsNotCompleted} · {Money(s.CardPaymentsNotCompletedValue)}", last: true))));

        // Orders
        if (data.Orders.Count > 0)
        {
            var orderRows = data.Orders.Select(o => new[]
            {
                $"<a href='{SiteUrl}/admin-orders' style='color:{Ink}; font-weight:700; text-decoration:none;'>#{Encode(o.Order_Number)}</a><div style='font-size:12px; color:{Muted};'>{o.Order_Date:HH:mm}</div>",
                Encode(o.Billing_FullName) + $"<div style='font-size:12px; color:{Muted};'>{Encode(o.Billing_City)}</div>",
                PaymentLabel(o),
                Money(o.Total_Amount)
            });
            rows.Append(Row(SectionTitle("Orders") + ItemsTable(new[]
            {
                ("Order", "left", false, false),
                ("Customer", "left", false, false),
                ("Payment", "left", true, false),
                ("Total", "right", false, false)
            }, orderRows), "8px 36px 24px 36px"));
        }

        if (data.TopProducts.Count > 0)
        {
            rows.Append(Row(SectionTitle("Best sellers") + ItemsTable(new[]
            {
                ("Product", "left", false, false),
                ("Qty", "center", false, false),
                ("Revenue", "right", false, false)
            }, data.TopProducts.Select(p => new[] { Encode(p.ProductName), p.Quantity.ToString(En), Money(p.Revenue) })), "8px 36px 24px 36px"));
        }

        // Leads
        var leads = new StringBuilder(SectionTitle("Possible leads"));
        if (data.Leads.Count == 0)
        {
            leads.Append(Note("No new leads, everyone who showed interest has ordered."));
        }
        else
        {
            leads.Append(Note("People who showed buying intent but have not ordered yet. A short call or email often closes the sale.", "0 0 12px 0"));
            const int shown = 30;
            leads.Append(ItemsTable(new[]
            {
                ("Contact", "left", false, false),
                ("Why", "left", false, false),
                ("Value", "right", false, false)
            }, data.Leads.Take(shown).Select(LeadRow)));
            if (data.Leads.Count > shown)
                leads.Append(Note($"+ {data.Leads.Count - shown} more.", "10px 0 0 0"));
        }
        rows.Append(Row(leads.ToString(), "8px 36px 24px 36px"));

        if (data.Sources.Count > 0)
        {
            rows.Append(Row(SectionTitle("Where visitors came from") + ItemsTable(new[]
            {
                ("Source", "left", false, false),
                ("Visitors", "right", false, false)
            }, data.Sources.Select(src => new[] { Encode(Capitalize(src.Source)), src.Visitors.ToString(En) })), "8px 36px 24px 36px"));
        }

        rows.Append(Row(Button($"{SiteUrl}/admin-orders", "Open admin panel") +
            Note("Visitors are counted by the website itself (no third-party tracking); bots are excluded. Times are Skopje time.", "18px 0 0 0"),
            "4px 36px 34px 36px"));

        return (subject, Page(subject, $"{s.OrdersPlaced} orders · {s.Visitors} visitors · {data.Leads.Count} leads", rows.ToString(), "Automated daily report for the Proteini.si team."));
    }

    private static string[] LeadRow(DailyReportLead lead)
    {
        var contact = new StringBuilder();
        contact.Append(string.IsNullOrWhiteSpace(lead.FullName) ? $"<span style='color:{Muted};'>No name</span>" : Encode(lead.FullName));
        if (!string.IsNullOrWhiteSpace(lead.Email))
            contact.Append($"<div style='font-size:12px;'><a href='mailto:{Encode(lead.Email)}' style='color:{Ink};'>{Encode(lead.Email)}</a></div>");
        if (!string.IsNullOrWhiteSpace(lead.Phone))
            contact.Append($"<div style='font-size:12px;'><a href='tel:{Encode(lead.Phone.Replace(" ", ""))}' style='color:{Ink};'>{Encode(lead.Phone)}</a></div>");

        var why = Encode(lead.Reason) + (lead.LastActivity is { } at ? $"<div style='font-size:12px; color:{Muted};'>{at:HH:mm}</div>" : "");
        return new[] { contact.ToString(), why, lead.Value is > 0 ? Money(lead.Value.Value) : "—" };
    }

    private static string PaymentLabel(DailyReportOrder o)
    {
        var method = o.Payment_Method == "credit_card" ? "Card" : "Cash on delivery";
        var status = o.IsPlaced
            ? (o.Order_Status is "cancelled" or "rejected" ? $"<span style='color:{Bad};'>{Encode(o.Order_Status)}</span>" : Encode(o.Order_Status))
            : $"<span style='color:{Bad};'>payment {Encode(o.Payment_Status)}</span>";
        return $"{method}<div style='font-size:12px; color:{Muted};'>{status}</div>";
    }

    // ------------------------------------------------------------------------------------------
    // Server report (developer)
    // ------------------------------------------------------------------------------------------

    public static (string Subject, string Html) BuildServer(DateOnly date, ServerStatusReport status, DailyReportSummary? summary)
    {
        var problems = status.Problems();
        var ok = problems.Count == 0;
        var subject = ok
            ? $"Server report {date.ToString("d MMM", En)} · all OK | {status.HostName}"
            : $"⚠ Server report {date.ToString("d MMM", En)} · {problems.Count} issue{Plural(problems.Count)} | {status.HostName}";

        var rows = new StringBuilder();
        rows.Append(Hero(ok ? "All systems OK" : "Needs attention", ok ? "Healthy" : $"{problems.Count} issue{Plural(problems.Count)}", ok ? Tone.Yellow : Tone.Ink,
            ok
                ? $"Everything on <strong>{Encode(status.HostName)}</strong> looked healthy during {Encode(date.ToString("d MMMM yyyy", En))}."
                : "<ul style='margin:0; padding-left:18px;'>" + string.Concat(problems.Select(p => $"<li>{Encode(p)}</li>")) + "</ul>"));

        // Host
        var memory = status.MemoryTotalMb is { } total && status.MemoryAvailableMb is { } free
            ? $"{total - free:N0} / {total:N0} MB used"
            : "unknown";
        var swap = status.SwapTotalMb is > 0 && status.SwapFreeMb is { } swapFree
            ? $"{status.SwapTotalMb - swapFree:N0} / {status.SwapTotalMb:N0} MB"
            : "none";
        var disks = status.Disks.Count == 0
            ? "unknown"
            : string.Join("<br>", status.Disks.Select(d => $"{Encode(d.Mount)} {d.UsedPercent:0}% · {d.FreeGb:0.0} GB free"));
        rows.Append(Row(Panel(
            Field("Uptime", status.Uptime is { } up ? $"{(int)up.TotalDays} d {up.Hours} h" : "unknown") +
                Field("Load (1 / 5 / 15 min)", status.LoadAverage is { Length: 3 } l ? $"{l[0]:0.00} / {l[1]:0.00} / {l[2]:0.00} <span style='color:{Muted}; font-weight:400;'>on {status.CpuCount} CPU</span>" : "unknown", last: true),
            Field("Memory", memory) + Field("Swap", swap, last: true),
            Field("Disk", disks, last: true))));

        // Services and endpoints
        if (status.Services.Count > 0)
        {
            rows.Append(Row(SectionTitle("Services") + ItemsTable(new[]
            {
                ("Service", "left", false, false),
                ("State", "left", false, false),
                ("Restarts", "right", true, false)
            }, status.Services.Select(svc => new[]
            {
                Encode(svc.Name) + (svc.Since == null ? "" : $"<div style='font-size:12px; color:{Muted};'>since {Encode(svc.Since)}</div>"),
                State(svc.Ok, svc.State),
                svc.Restarts?.ToString(En) ?? "—"
            })), "8px 36px 24px 36px"));
        }

        if (status.FailedUnits.Count > 0)
            rows.Append(Row(Callout($"<strong>Failed systemd units:</strong> {Encode(string.Join(", ", status.FailedUnits))}")));

        if (status.Endpoints.Count > 0)
        {
            rows.Append(Row(SectionTitle("Health checks") + ItemsTable(new[]
            {
                ("Endpoint", "left", false, false),
                ("Result", "left", false, false),
                ("Time", "right", false, false)
            }, status.Endpoints.Select(e => new[]
            {
                Encode(e.Name) + $"<div style='font-size:12px; color:{Muted}; word-break:break-all;'>{Encode(e.Url)}</div>",
                State(e.Ok, e.StatusCode?.ToString(En) ?? e.Error ?? "no answer"),
                $"{e.ElapsedMs:N0} ms"
            })), "8px 36px 24px 36px"));
        }

        if (status.Certificates.Count > 0)
        {
            rows.Append(Row(SectionTitle("TLS certificates") + ItemsTable(new[]
            {
                ("Certificate", "left", false, false),
                ("Expires", "right", false, false)
            }, status.Certificates.Select(c => new[]
            {
                Encode(c.Name),
                c.ExpiresAt is { } exp ? State(c.Ok, $"{exp:yyyy-MM-dd} ({c.DaysLeft} d)") : State(false, c.Error ?? "unknown")
            })), "8px 36px 24px 36px"));
        }

        if (status.Databases.Count > 0)
        {
            rows.Append(Row(SectionTitle("Databases") + ItemsTable(new[]
            {
                ("Database", "left", false, false),
                ("Data", "right", false, false),
                ("Log", "right", false, false)
            }, status.Databases.Select(d => new[] { Encode(d.DatabaseName), $"{d.DataMb:N1} MB", $"{d.LogMb:N1} MB" })), "8px 36px 24px 36px"));
        }

        if (status.Traffic is { } traffic)
        {
            var paths = traffic.Top5xx.Count == 0
                ? ""
                : "<div style='margin-top:10px;'>" + string.Join("", traffic.Top5xx.Select(p => $"<div style='font-family:\"Courier New\", Courier, monospace; font-size:12px; color:{Body}; word-break:break-all;'>{p.Count}× {Encode(p.Path)}</div>")) + "</div>";
            rows.Append(Row(Panel(
                Field("Requests (nginx)", traffic.Requests.ToString("N0", En)) + Field("Unique IPs", traffic.UniqueIps.ToString("N0", En), last: true),
                Field("4xx responses", traffic.Status4xx.ToString("N0", En)) + Field("5xx responses", State(traffic.Status5xx == 0, traffic.Status5xx.ToString("N0", En)), last: true) + paths)));
        }

        // Errors
        var errors = new StringBuilder(SectionTitle("Errors"));
        if (status.LogSources.Count > 0)
        {
            errors.Append(ItemsTable(new[]
            {
                ("Log", "left", false, false),
                ("Fatal", "center", false, false),
                ("Errors", "center", false, false),
                ("Warnings", "right", false, false)
            }, status.LogSources.Select(src => new[]
            {
                Encode(src.Source),
                State(src.Fatal == 0, src.Fatal.ToString(En)),
                State(src.Errors == 0, src.Errors.ToString(En)),
                src.Warnings.ToString(En)
            })));
        }

        if (status.Errors.Count == 0)
        {
            errors.Append(Note("No errors were logged.", "12px 0 0 0"));
        }
        else
        {
            foreach (var group in status.Errors.Take(25))
            {
                errors.Append($"<div style='margin-top:16px; padding:14px 16px; background:{Paper}; border-left:4px solid {(group.Level == "FTL" ? Bad : Yellow)}; border-radius:8px;'>");
                errors.Append($"<div style='font-size:11px; line-height:15px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:{Muted};'>{Encode(group.Source)} · {Encode(group.Level)} · {group.Count}× · {group.FirstSeen:HH:mm}{(group.Count > 1 ? $" to {group.LastSeen:HH:mm}" : "")} UTC</div>");
                errors.Append($"<div style='margin-top:4px; font-size:14px; line-height:20px; font-weight:700; color:{Ink}; word-break:break-word;'>{Encode(group.Message)}</div>");
                if (!string.IsNullOrWhiteSpace(group.Detail))
                    errors.Append($"<pre style='margin:8px 0 0 0; white-space:pre-wrap; word-break:break-all; font-family:\"Courier New\", Courier, monospace; font-size:11px; line-height:16px; color:{Body};'>{Encode(group.Detail)}</pre>");
                errors.Append("</div>");
            }
            if (status.Errors.Count > 25)
                errors.Append(Note($"+ {status.Errors.Count - 25} more distinct errors in the logs.", "12px 0 0 0"));
        }
        rows.Append(Row(errors.ToString(), "8px 36px 24px 36px"));

        if (summary != null)
        {
            rows.Append(Row(Panel(
                Field("Visitors", summary.Visitors.ToString(En)) + Field("Orders", summary.OrdersPlaced.ToString(En), last: true),
                Field("Revenue", Money(summary.Revenue)) + Field("New accounts", summary.NewAccounts.ToString(En), last: true))));
        }

        if (status.CollectorNotes.Count > 0)
            rows.Append(Row(Note("Checks that could not run: " + Encode(string.Join("; ", status.CollectorNotes)))));

        rows.Append(Row(Note($"Collected {status.CollectedAtUtc:yyyy-MM-dd HH:mm} UTC on {Encode(status.HostName)}."), "0 36px 34px 36px"));

        return (subject, Page(subject, ok ? "All systems OK" : string.Join(", ", problems), rows.ToString(), "Automated server report for the developer.", width: 640));
    }

    // ------------------------------------------------------------------------------------------
    // Building blocks
    // ------------------------------------------------------------------------------------------

    private static string Tiles(params string[] tiles)
    {
        var sb = new StringBuilder("<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'><tr>");
        for (var i = 0; i < tiles.Length; i++)
        {
            var gap = i < tiles.Length - 1 ? "padding:0 12px 0 0;" : "padding:0;";
            sb.Append($"<td class='stack stack-gap' width='{100 / tiles.Length}%' style='{gap} vertical-align:top;'>{tiles[i]}</td>");
        }
        return sb.Append("</tr></table>").ToString();
    }

    private static string Tile(string label, int value, int? previous, string detail) =>
        TileText(label, value.ToString("N0", En), Delta(value, previous), detail);

    private static string TileText(string label, string value, string delta, string detail) =>
        $"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='background:{Paper}; border-radius:12px;'><tr><td style='padding:16px 16px 14px 16px;'>" +
        $"<div style='font-size:11px; line-height:15px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:{Muted};'>{Encode(label)}</div>" +
        $"<div style='margin-top:4px; font-family:{DisplayFont}; font-size:28px; line-height:32px; font-weight:700; color:{Ink}; white-space:nowrap;'>{value}</div>" +
        $"<div style='margin-top:2px; font-size:12px; line-height:17px; color:{Muted};'>{delta}{Encode(detail)}</div>" +
        "</td></tr></table>";

    private static string Delta(decimal value, decimal? previous, bool money = false)
    {
        if (previous == null) return "";
        var diff = value - previous.Value;
        if (diff == 0) return $"<span style='color:{Muted};'>= </span>";
        var text = money ? Money(Math.Abs(diff)) : Math.Abs(diff).ToString("N0", En);
        return diff > 0
            ? $"<span style='color:{Good}; font-weight:700;'>▲ {text}</span> · "
            : $"<span style='color:{Bad}; font-weight:700;'>▼ {text}</span> · ";
    }

    private static string Delta(int value, int? previous) => Delta(value, (decimal?)previous);

    private static string FunnelBar(string label, int value, int top)
    {
        var percent = (int)Math.Round(value * 100.0 / top);
        var width = Math.Max(value > 0 ? 2 : 0, percent);
        var bar = width == 0
            ? $"<td style='height:12px; background:{Line}; border-radius:6px; font-size:0; line-height:0;'>&nbsp;</td>"
            : $"<td width='{width}%' style='height:12px; background:{Yellow}; border-radius:6px; font-size:0; line-height:0;'>&nbsp;</td>" +
              (width < 100 ? $"<td style='height:12px; font-size:0; line-height:0;'>&nbsp;</td>" : "");
        return "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0' style='margin:0 0 12px 0;'>" +
               $"<tr><td style='font-size:13px; line-height:18px; color:{Body}; padding:0 0 4px 0;'>{Encode(label)}</td>" +
               $"<td align='right' style='font-size:13px; line-height:18px; font-weight:700; color:{Ink}; padding:0 0 4px 0; white-space:nowrap;'>{value:N0} <span style='color:{Muted}; font-weight:400;'>({percent}%)</span></td></tr>" +
               $"<tr><td colspan='2' style='background:{Paper}; border-radius:6px;'><table role='presentation' width='100%' cellpadding='0' cellspacing='0' border='0'><tr>{bar}</tr></table></td></tr>" +
               "</table>";
    }

    private static string State(bool ok, string text) =>
        $"<span style='color:{(ok ? Good : Bad)}; font-weight:700;'>{Encode(text)}</span>";

    public static string Money(decimal amount) => $"MKD {amount.ToString("N0", En)}";

    private static string Plural(int count) => count == 1 ? "" : "s";

    private static string Capitalize(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToUpperInvariant(value[0]) + value[1..];
}
