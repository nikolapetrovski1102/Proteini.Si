using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;
using ProteiniSi.Services;
using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class OrderStatusEmailTests
{
    private sealed class CapturingSender : IEmailSender
    {
        public List<(IReadOnlyCollection<string> To, IReadOnlyCollection<string> Cc, string Subject, string Html)> Sent { get; } = [];

        public Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody) => Task.CompletedTask;

        public Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody)
        {
            Sent.Add((recipients, ccRecipients, subject, htmlBody));
            return Task.FromResult(new EmailSendResult { Success = true });
        }
    }

    private static (OrderEmailService Service, CapturingSender Sender) Create()
    {
        var sender = new CapturingSender();
        var config = new ConfigurationBuilder().AddInMemoryCollection().Build();
        // The status email never reads the order provider, so a null stand-in is enough here.
        var service = new OrderEmailService(null!, sender, config, NullLogger<OrderEmailService>.Instance, null!);
        return (service, sender);
    }

    private static OrderStatusSnapshot Order() => new()
    {
        Order_Id = 1369,
        Order_Number = "ORD-20261109-5673",
        Billing_Email = "customer@example.com",
        Billing_FullName = "Ana Test",
        Total_Amount = 2450m
    };

    [Theory]
    [InlineData("confirmed", "потврдена")]
    [InlineData("shipped", "испратена")]
    [InlineData("delivered", "доставена")]
    [InlineData("rejected", "одбиена")]
    public async Task CustomerGetsAStatusEmail(string status, string word)
    {
        var (service, sender) = Create();
        var tracking = status == "shipped";

        var sent = await service.SendAdminStatusEmailAsync(Order(), status, "pending",
            tracking ? "TEST123456MK" : null,
            tracking ? "https://www.posta.com.mk/tnt?code=TEST123456MK" : null);

        Assert.True(sent);
        var mail = Assert.Single(sender.Sent);
        Assert.Equal(["customer@example.com"], mail.To);
        Assert.Empty(mail.Cc); // status mails go to the customer only, not the shop copy list
        Assert.Contains(word, mail.Subject);
        Assert.Contains(EmailLayout.BannerUrl, mail.Html);
        Assert.Contains("content='light only'", mail.Html);
        Assert.Contains("prefers-color-scheme: dark", mail.Html);

        if (tracking)
        {
            Assert.Contains("TEST123456MK", mail.Html);
            Assert.Contains("https://www.posta.com.mk/tnt?code=TEST123456MK", mail.Html);
        }

        // Set EMAIL_PREVIEW_DIR to look at the rendered mails in a browser.
        var dir = Environment.GetEnvironmentVariable("EMAIL_PREVIEW_DIR");
        if (!string.IsNullOrWhiteSpace(dir))
            await File.WriteAllTextAsync(Path.Combine(dir, $"status-{status}.html"), mail.Html);
    }

    [Fact]
    public async Task AlbanianOrderGetsAlbanianStatusEmail()
    {
        var (service, sender) = Create();
        var order = Order();
        order.Language = "al";

        await service.SendAdminStatusEmailAsync(order, "shipped", "paid", "TEST123456MK", "https://www.posta.com.mk/tnt?code=TEST123456MK");

        var mail = Assert.Single(sender.Sent);
        Assert.Equal("Porosia u dërgua - #ORD-20261109-5673 | Proteini.mk", mail.Subject);
        Assert.Contains("Gjurmo d&#235;rges&#235;n", mail.Html);
        Assert.Contains("Shkup, Maqedoni", mail.Html);
        Assert.Contains("<html lang='sq'>", mail.Html);
        Assert.DoesNotContain("Почитувани", mail.Html);

        var dir = Environment.GetEnvironmentVariable("EMAIL_PREVIEW_DIR");
        if (!string.IsNullOrWhiteSpace(dir))
            await File.WriteAllTextAsync(Path.Combine(dir, "status-shipped-al.html"), mail.Html);
    }

    [Theory]
    [InlineData(null, "Нарачката е откажана - #ORD-1 | Proteini.mk", "Продолжи со купување")]
    [InlineData("al", "Porosia u anulua - #ORD-1 | Proteini.mk", "Vazhdo blerjen")]
    public async Task CancellationEmailFollowsTheOrderLanguage(string? language, string subject, string button)
    {
        var (service, sender) = Create();

        await service.SendCancellationAsync(new OrderCancelOutcome
        {
            Order_Number = "ORD-1", User_Email = "customer@example.com", User_FullName = "Ana", Points_Redeemed = 120, Language = language
        });

        var mail = Assert.Single(sender.Sent);
        Assert.Equal(subject, mail.Subject);
        Assert.Contains(button, mail.Html);
        Assert.Contains("<strong>120</strong>", mail.Html);
    }
}
