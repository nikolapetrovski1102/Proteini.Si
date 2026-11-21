using ProteiniSi.Models;
using ProteiniSi.Services;
using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class DailyReportTests
{
    private static readonly DateTimeOffset From = new(2026, 11, 9, 23, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset To = From.AddDays(1);

    [Fact]
    public void SerilogErrorsAreGroupedWithStackTrace()
    {
        var lines = new[]
        {
            "2026-11-09 22:59:59.000 +00:00 [ERR] Before the window",
            "2026-11-10 08:29:18.082 +00:00 [WRN] Slow procedure dbo.usp_Product_Filter took 515 ms",
            "2026-11-10 09:00:00.000 +00:00 [ERR] Failed to send order confirmation email for order 1364",
            "System.Net.Sockets.SocketException (111): Connection refused",
            "   at MailKit.Net.Smtp.SmtpClient.ConnectAsync()",
            "2026-11-10 10:00:00.000 +00:00 [ERR] Failed to send order confirmation email for order 1365",
            "2026-11-10 11:00:00.000 +00:00 [FTL] Host terminated unexpectedly",
            "2026-11-10 12:00:00.000 +00:00 [INF] All good"
        };

        var (summary, errors) = ServerLogParser.Summarize("prod", ServerLogParser.ReadSerilog(lines), From, To);

        Assert.Equal(1, summary.Warnings);
        Assert.Equal(2, summary.Errors);
        Assert.Equal(1, summary.Fatal);
        Assert.Equal(2, errors.Count);
        var mail = errors.Single(e => e.Level == "ERR");
        Assert.Equal(2, mail.Count);
        Assert.Contains("Connection refused", mail.Detail);
    }

    [Fact]
    public void NginxSummaryCountsWindowOnly()
    {
        var lines = new[]
        {
            "1.1.1.1 - - [09/Nov/2026:22:00:00 +0000] \"GET / HTTP/1.1\" 200 10 \"-\" \"ua\"",
            "1.1.1.1 - - [10/Nov/2026:09:23:12 +0000] \"GET /api/Products?x=1 HTTP/1.1\" 502 10 \"-\" \"ua\"",
            "2.2.2.2 - - [10/Nov/2026:09:24:12 +0000] \"GET /missing HTTP/1.1\" 404 10 \"-\" \"ua\"",
            "2.2.2.2 - - [10/Nov/2026:09:25:12 +0000] \"POST /api/Order/Create HTTP/1.1\" 200 10 \"-\" \"ua\""
        };

        var traffic = ServerLogParser.SummarizeNginx(lines, From, To);

        Assert.Equal(3, traffic.Requests);
        Assert.Equal(2, traffic.UniqueIps);
        Assert.Equal(1, traffic.Status4xx);
        Assert.Equal(1, traffic.Status5xx);
        Assert.Equal("502 GET /api/Products", traffic.Top5xx.Single().Path);
    }

    [Fact]
    public void NginxErrorAndJournalLinesAreParsed()
    {
        var nginx = ServerLogParser.ReadNginxErrors(new[]
        {
            "2026/11/10 09:00:00 [error] 1234#1234: *5 connect() failed (111: Connection refused) while connecting to upstream",
            "2026/11/10 09:01:00 [crit] 1234#1234: SSL_do_handshake() failed",
            "2026/11/21 16:16:00 [error] 1234#1234: *9 directory index of \"/srv/proteinisi/prod/web/img/\" is forbidden, client: 1.2.3.4, server: proteini.mk, request: \"GET /img/ HTTP/1.1\"",
            "2026/11/21 16:17:00 [error] 1234#1234: *10 access forbidden by rule, client: 1.2.3.4, server: proteini.mk, request: \"GET /.env HTTP/1.1\"",
            "garbage"
        }, TimeSpan.Zero).ToList();
        Assert.Equal(new[] { "ERR", "FTL", "WRN", "WRN" }, nginx.Select(e => e.Level));
        Assert.StartsWith("connect() failed", nginx[0].Message);

        var journal = ServerLogParser.ReadJournal(new[]
        {
            "2026-11-10T07:02:23+00:00 proteini-si systemd[1]: proteinisi-api-prod.service: Failed with result 'exit-code'.",
            "2026-11-10T07:02:24+0000 proteini-si dotnet[999]: Unhandled exception"
        }).ToList();
        Assert.Equal(2, journal.Count);
        Assert.StartsWith("systemd: proteinisi-api-prod.service", journal[0].Message);
        Assert.Equal(new DateTimeOffset(2026, 11, 10, 7, 2, 24, TimeSpan.Zero), journal[1].Timestamp);
    }

    [Theory]
    [InlineData("https://www.google.com/search?q=protein", "google")]
    [InlineData("https://l.facebook.com/l.php?u=x", "facebook")]
    [InlineData("https://proteini.mk/products", null)]
    [InlineData("https://stage.proteini.mk/", null)]
    [InlineData("https://forum.example.org/thread", "forum.example.org")]
    [InlineData("android-app://com.google.android.gm", null)]
    public void ReferrerIsReducedToSource(string referrer, string? expected) =>
        Assert.Equal(expected, AnalyticsService.NormalizeReferrer(referrer, new[] { "proteini.mk" }));

    [Fact]
    public void PathDropsQueryString() =>
        Assert.Equal("/order-confirmation/12", AnalyticsService.NormalizePath("/order-confirmation/12?token=secret"));

    [Theory]
    [InlineData("Mozilla/5.0 (compatible; Googlebot/2.1)", true)]
    [InlineData("", true)]
    [InlineData("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1", false)]
    public void BotsAreDetected(string ua, bool bot) => Assert.Equal(bot, AnalyticsService.IsBot(ua));

    [Fact]
    public void EmailsRenderAndEncodeUserInput()
    {
        var data = new DailyReportData
        {
            Summary = new DailyReportSummary { Visitors = 120, NewVisitors = 80, CartVisitors = 20, CheckoutVisitors = 8, OrderVisitors = 5, OrdersPlaced = 5, Revenue = 12345 },
            Orders = { new DailyReportOrder { Order_Number = "ORD-1", Billing_FullName = "<script>x</script>", Payment_Method = "credit_card", Payment_Status = "pending", Total_Amount = 1000 } },
            Leads = { new DailyReportLead { Priority = 1, Reason = "Card payment not completed", FullName = "Ana", Email = "ana@example.com", Phone = "070 123 456", Value = 1000 } }
        };

        var (subject, html) = DailyReportEmails.BuildBusiness(new DateOnly(2026, 11, 9), data, new DailyReportSummary { Visitors = 100 });
        Assert.Contains("5 orders", subject);
        Assert.Contains("&lt;script&gt;", html);
        Assert.DoesNotContain("<script>x", html);
        Assert.Contains("mailto:ana@example.com", html);

        var status = new ServerStatusReport { HostName = "test", Services = { new ServiceStatus { Name = "nginx", State = "failed" } } };
        var (serverSubject, serverHtml) = DailyReportEmails.BuildServer(new DateOnly(2026, 11, 9), status, null);
        Assert.StartsWith("⚠", serverSubject);
        Assert.Contains("nginx is failed", serverHtml);
    }
}
