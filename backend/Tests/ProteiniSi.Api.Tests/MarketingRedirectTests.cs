using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

/// <summary>Marketing:RedirectAllTo must keep every marketing email away from real customers.</summary>
public class MarketingRedirectTests
{
    private const string Safe = "nikpetrovski007@gmail.com";

    [Fact]
    public async Task Scheduled_run_sends_only_to_redirect_address()
    {
        var sender = new FakeSender();
        var service = Service(sender, new FakeProvider("customer1@example.com", "customer2@example.com"));

        var results = await service.RunAsync(new MarketingRunOptions { Force = true });

        Assert.Equal(2, results.Single().Sent);
        Assert.Equal(2, sender.Recipients.Count);
        Assert.All(sender.Recipients, r => Assert.Equal(Safe, r));
    }

    [Fact]
    public async Task Admin_test_send_goes_to_redirect_address()
    {
        var sender = new FakeSender();
        var service = Service(sender, new FakeProvider());

        await service.SendTestAsync(MarketingEmailTemplate.Welcome, null, "someadmin@example.com", "Admin");

        Assert.Equal([Safe], sender.Recipients);
    }

    [Fact]
    public async Task New_discount_sends_one_email_per_person_and_logs_every_discount()
    {
        var sender = new FakeSender();
        var provider = new FakeProvider
        {
            Templates = [new MarketingEmailTemplate
            {
                Code = MarketingEmailTemplate.NewDiscount, Name = "new_discount", IsActive = true, SendTime = TimeSpan.Zero, DelayValue = 3,
                Subject = "Попуст до {procent}", Heading = "Нов попуст", Body = "{popust}", ButtonText = "Купи"
            }],
            NewDiscountRows =
            [
                new NewDiscountRecipient { DiscountId = 1, Email = "a@example.com", ReferenceKey = "discount:1:a@example.com" },
                new NewDiscountRecipient { DiscountId = 2, Email = "a@example.com", ReferenceKey = "discount:2:a@example.com" },
                new NewDiscountRecipient { DiscountId = 3, Email = "a@example.com", ReferenceKey = "discount:3:a@example.com" },
                new NewDiscountRecipient { DiscountId = 1, Email = "b@example.com", ReferenceKey = "discount:1:b@example.com" },
                new NewDiscountRecipient { DiscountId = 3, Email = "c@example.com", ReferenceKey = "discount:3:c@example.com" }
            ],
            Discounts =
            {
                [1] = new MarketingDiscount { DiscountId = 1, Name = "A", Percentage = 10, Products = [new FeaturedProduct { ProductId = 1, ProductName = "X", Price = 100, SalePrice = 90 }] },
                [2] = new MarketingDiscount { DiscountId = 2, Name = "B", Percentage = 30, Products = [new FeaturedProduct { ProductId = 2, ProductName = "Y", Price = 100, SalePrice = 70 }] },
                [3] = new MarketingDiscount { DiscountId = 3, Name = "C", Percentage = 50 } // nothing to show: not announced
            }
        };

        var result = (await Service(sender, provider).RunAsync(new MarketingRunOptions { Force = true })).Single();

        Assert.Equal(2, result.Candidates);   // a (A + B in one email) and b; c only had the empty discount
        Assert.Equal(2, result.Sent);
        Assert.Equal(["discount:1:a@example.com", "discount:2:a@example.com", "discount:1:b@example.com"], provider.Logged);
        Assert.Contains("Попуст до 30%", sender.Subjects[0]);
    }

    private static MarketingAutomationService Service(FakeSender sender, FakeProvider provider)
    {
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Marketing:Enabled"] = "true",
            ["Marketing:RedirectAllTo"] = Safe,
            ["Marketing:SendDelayMs"] = "0",
            ["AppSettings:TokenKey"] = "test-token-key-test-token-key-test-token-key",
            ["AppSettings:FrontendUrl"] = "https://proteini.mk"
        }).Build();
        return new MarketingAutomationService(provider, null!, sender, config, NullLogger<MarketingAutomationService>.Instance);
    }

    private sealed class FakeSender : IEmailSender
    {
        public List<string> Recipients { get; } = [];
        public List<string> Subjects { get; } = [];
        public Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody) => Task.CompletedTask;
        public Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody)
        {
            Recipients.AddRange(recipients);
            Subjects.Add(subject);
            return Task.FromResult(new EmailSendResult { Success = true });
        }
    }

    private sealed class FakeProvider(params string[] emails) : IMarketingAutomationProvider
    {
        private static MarketingEmailTemplate Welcome() => new()
        {
            Code = MarketingEmailTemplate.Welcome, Name = "welcome", IsActive = true, SendTime = TimeSpan.Zero,
            Subject = "Здраво {ime}", Heading = "Добредојде", Body = "Текст", ButtonText = "Купи"
        };

        public Task SetConsentAsync(string? email, int? userId, bool consent, string source, DateTime? givenAt) => Task.CompletedTask;
        public List<MarketingEmailTemplate>? Templates { get; init; }
        public List<NewDiscountRecipient> NewDiscountRows { get; init; } = [];
        public Dictionary<int, MarketingDiscount> Discounts { get; } = [];
        public List<string> Logged { get; } = [];

        public Task<List<MarketingEmailTemplate>> GetTemplatesAsync() => Task.FromResult(Templates ?? [Welcome()]);
        public Task<bool> UpdateTemplateAsync(MarketingEmailTemplate template, string? updatedBy) => Task.FromResult(true);
        public Task<bool> TryClaimRunAsync(string templateCode, DateOnly runDate, bool force) => Task.FromResult(true);
        public Task<List<MarketingRecipient>> GetWelcomeRecipientsAsync(int minAgeHours, int maxAgeDays, int capHours) =>
            Task.FromResult(emails.Select((e, i) => new MarketingRecipient { Email = e, UserId = i + 1, FullName = "Купувач", ReferenceKey = $"user:{i + 1}" }).ToList());
        public Task<List<MarketingRecipient>> GetAbandonedCheckoutsAsync(int minAgeHours, int maxAgeHours, int capHours) => Task.FromResult(new List<MarketingRecipient>());
        public Task<List<ReplenishmentItem>> GetReplenishmentsAsync(int daysBefore, int minServings, int capHours) => Task.FromResult(new List<ReplenishmentItem>());
        public Task<List<NewDiscountRecipient>> GetNewDiscountRecipientsAsync(int maxAgeDays, int capHours) => Task.FromResult(NewDiscountRows);
        public Task<MarketingDiscount?> GetDiscountProductsAsync(int discountId, int top) => Task.FromResult(Discounts.GetValueOrDefault(discountId));
        public Task<List<FeaturedProduct>> GetFeaturedProductsAsync(int top) => Task.FromResult(new List<FeaturedProduct>());
        public Task<bool> TryLogAsync(string templateCode, string email, int? userId, string referenceKey, string status, string? error)
        {
            Logged.Add(referenceKey);
            return Task.FromResult(true);
        }
        public Task<(List<MarketingLogEntry> Entries, MarketingAudienceStats Stats)> GetRecentLogAsync(int top) =>
            Task.FromResult((new List<MarketingLogEntry>(), new MarketingAudienceStats()));
    }
}
