using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class GuestCheckoutVerificationTests
{
    private const string Email = "Guest@Example.com";

    private sealed class CapturingEmailSender : IEmailSender
    {
        public string? LastBody { get; private set; }
        public int Sent { get; private set; }

        public Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody)
        {
            LastBody = subject;
            Sent++;
            return Task.CompletedTask;
        }

        public Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody) =>
            throw new NotSupportedException();

        public string Code => Regex.Match(LastBody!, @"\d{6}").Value;
    }

    private sealed class CapturingAnalytics : IAnalyticsService
    {
        public List<string> Leads { get; } = new();
        public Task TrackAsync(TrackEventDto dto, int? userId, string? userAgent) => Task.CompletedTask;
        public Task RecordCheckoutLeadAsync(string email, string? fullName, bool? marketingConsent = null)
        {
            Leads.Add(email);
            return Task.CompletedTask;
        }
    }

    private static (GuestCheckoutVerificationService Service, CapturingEmailSender Sender) Create(string key = "synthetic-guest-checkout-key")
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["AppSettings:TokenKey"] = key })
            .Build();
        var sender = new CapturingEmailSender();
        return (new GuestCheckoutVerificationService(new MemoryCache(new MemoryCacheOptions()), sender, config, new CapturingAnalytics()), sender);
    }

    [Fact]
    public async Task CorrectCodeYieldsTokenBoundToEmail()
    {
        var (service, sender) = Create();
        await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });

        var result = service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = " guest@example.com ", Code = sender.Code });

        Assert.True(service.IsVerified("GUEST@example.com", result.VerificationToken));
        Assert.False(service.IsVerified("other@example.com", result.VerificationToken));
        Assert.False(service.IsVerified(Email, null));
        Assert.False(service.IsVerified(Email, "123.abc"));
    }

    [Fact]
    public async Task TokenFromAnotherKeyIsRejected()
    {
        var (service, sender) = Create("key-one");
        await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });
        var token = service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = Email, Code = sender.Code }).VerificationToken;

        var (other, _) = Create("key-two");
        Assert.False(other.IsVerified(Email, token));
    }

    [Fact]
    public async Task CodeCanOnlyBeUsedOnce()
    {
        var (service, sender) = Create();
        await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });
        service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = Email, Code = sender.Code });

        Assert.Throws<BadRequestException>(() =>
            service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = Email, Code = sender.Code }));
    }

    [Fact]
    public async Task WrongCodesLockOutAfterMaxAttempts()
    {
        var (service, sender) = Create();
        await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });
        var wrong = sender.Code == "000000" ? "111111" : "000000";

        for (var i = 0; i < GuestCheckoutVerificationService.MaxAttempts; i++)
            Assert.Throws<BadRequestException>(() =>
                service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = Email, Code = wrong }));

        // Even the right code no longer works; a new one must be requested.
        Assert.Throws<BadRequestException>(() =>
            service.ConfirmCode(new GuestCheckoutCodeConfirmDto { Email = Email, Code = sender.Code }));
    }

    [Fact]
    public async Task ResendWithinCooldownDoesNotSendAgain()
    {
        var (service, sender) = Create();
        await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });
        var second = await service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = Email });

        Assert.Equal(1, sender.Sent);
        Assert.InRange(second.RetryAfterSeconds, 1, GuestCheckoutVerificationService.ResendCooldownSeconds);
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-an-email")]
    [InlineData("a@b")]
    [InlineData("two@@example.com")]
    public async Task InvalidEmailIsRejected(string email)
    {
        var (service, _) = Create();
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.SendCodeAsync(new GuestCheckoutCodeRequestDto { Email = email }));
    }
}
