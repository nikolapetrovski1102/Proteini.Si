using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;
using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class PasswordlessSignInTests
{
    private sealed class CapturingEmailSender : IEmailSender
    {
        public string? LastSubject { get; private set; }
        public int Sent { get; private set; }

        public Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody)
        {
            LastSubject = subject;
            Sent++;
            return Task.CompletedTask;
        }

        public Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody) =>
            throw new NotSupportedException();

        public string Code => Regex.Match(LastSubject!, @"\d{6}").Value;
    }

    /// <summary>In-memory stand-in for the users table and usp_User_SignInExternal.</summary>
    private sealed class FakeUserProvider : IUserProvider
    {
        public readonly List<User> Users = [];
        public readonly Dictionary<(string Provider, string Key), int> Logins = [];
        public (string? Provider, string? Email, string? Name, bool AllowLink)? LastSignIn;

        public Task<User?> GetByIdAsync(int userId) => Task.FromResult(Users.FirstOrDefault(u => u.User_Id == userId));

        public Task<User?> GetByEmailAsync(string email) =>
            Task.FromResult(Users.FirstOrDefault(u => string.Equals(u.User_Email, email, StringComparison.OrdinalIgnoreCase)));

        public Task<bool> EmailExistsAsync(string? email) =>
            Task.FromResult(Users.Any(u => string.Equals(u.User_Email, email, StringComparison.OrdinalIgnoreCase)));

        public Task<ExternalSignInResult> SignInExternalAsync(string? provider, string? providerKey, string? email, string? fullName, bool allowLink)
        {
            LastSignIn = (provider, email, fullName, allowLink);
            if (provider != null && Logins.TryGetValue((provider, providerKey!), out var known))
                return Task.FromResult(new ExternalSignInResult(ExternalSignInOutcome.ExistingIdentity, known));
            if (email == null)
                return Task.FromResult(new ExternalSignInResult(ExternalSignInOutcome.EmailRequired, null));

            var user = Users.FirstOrDefault(u => string.Equals(u.User_Email, email, StringComparison.OrdinalIgnoreCase));
            ExternalSignInOutcome outcome;
            if (user != null)
            {
                if (provider != null && !allowLink)
                    return Task.FromResult(new ExternalSignInResult(ExternalSignInOutcome.LinkNotAllowed, user.User_Id));
                if (!user.EmailConfirmed)
                {
                    user.PasswordHash = null;
                    user.PasswordSalt = null;
                }
                user.EmailConfirmed = true;
                outcome = ExternalSignInOutcome.LinkedToAccount;
            }
            else
            {
                user = new User { User_Id = Users.Count + 1, User_Email = email, User_FullName = fullName ?? "", EmailConfirmed = true };
                Users.Add(user);
                outcome = ExternalSignInOutcome.Created;
            }

            if (provider != null)
                Logins[(provider, providerKey!)] = user.User_Id;
            return Task.FromResult(new ExternalSignInResult(outcome, user.User_Id));
        }

        public Dictionary<int, string> Languages { get; } = new();
        public Task SetLanguageAsync(int userId, string language) { Languages[userId] = language; return Task.CompletedTask; }
        public Task<int> GetIdByEmailAsync(string? email) => throw new NotSupportedException();
        public Task<int?> RegisterAsync(NewUser user) => throw new NotSupportedException();
        public Task SetResetTokenAsync(int userId, string token, DateTime expires) => throw new NotSupportedException();
        public Task<ResetTokenInfo?> GetResetTokenAsync(int userId) => throw new NotSupportedException();
        public Task<bool> ResetPasswordAsync(int userId, string token, byte[] passwordHash, byte[] passwordSalt) => throw new NotSupportedException();
        public Task<int> UpdateBillingInfoAsync(int userId, UserForUpdateDto info) => throw new NotSupportedException();
        public Task SetEmailCodeAsync(int userId, byte[] codeHash, DateTime expiresAt, DateTime sentAt) => throw new NotSupportedException();
        public Task<EmailCodeInfo?> GetEmailCodeAsync(int userId) => throw new NotSupportedException();
        public Task<int> IncrementEmailCodeAttemptsAsync(int userId) => throw new NotSupportedException();
        public Task<bool> ConfirmEmailAsync(int userId, byte[] codeHash, DateTime confirmedAt) => throw new NotSupportedException();
    }

    private sealed class FakeVerifier(string provider, ExternalIdentity? identity) : IExternalIdentityVerifier
    {
        public string Provider => provider;
        public bool IsConfigured => true;
        public Task<ExternalIdentity?> VerifyAsync(string token, CancellationToken cancellationToken = default) =>
            Task.FromResult(token == "good" ? identity : null);
    }

    private static (UserService Service, FakeUserProvider Users, CapturingEmailSender Sender) Create(params IExternalIdentityVerifier[] verifiers)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:TokenKey"] = "synthetic-signin-test-key-that-is-long-enough-for-hmac-sha512-signing-0123456789",
                ["AppSettings:PasswordKey"] = "synthetic-password-key"
            })
            .Build();
        var users = new FakeUserProvider();
        var sender = new CapturingEmailSender();
        var service = new UserService(users, sender, config, new MemoryCache(new MemoryCacheOptions()), verifiers);
        return (service, users, sender);
    }

    [Fact]
    public async Task NewEmailNeedsNameThenCreatesConfirmedAccount()
    {
        var (service, users, sender) = Create();

        var sent = await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = " New@Example.com " });
        Assert.True(sent.IsNewAccount);

        var missingName = await Assert.ThrowsAsync<BadRequestException>(() =>
            service.SignInWithEmailCodeAsync(new EmailCodeSignInDto { User_Email = "new@example.com", Code = sender.Code }));
        Assert.Equal("Full name is required", missingName.Message);

        // The name check did not burn the code.
        var result = await service.SignInWithEmailCodeAsync(new EmailCodeSignInDto
        {
            User_Email = "new@example.com", Code = sender.Code, User_FullName = "  Ana   Petrova "
        });

        Assert.True(result.IsNewAccount);
        Assert.False(string.IsNullOrEmpty(result.Token));
        var user = Assert.Single(users.Users);
        Assert.Equal("new@example.com", user.User_Email);
        Assert.Equal("Ana Petrova", user.User_FullName);
    }

    [Fact]
    public async Task CodeIsSingleUse()
    {
        var (service, users, sender) = Create();
        users.Users.Add(new User { User_Id = 1, User_Email = "a@example.com", User_FullName = "A", EmailConfirmed = true });

        await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = "a@example.com" });
        var request = new EmailCodeSignInDto { User_Email = "a@example.com", Code = sender.Code };

        var first = await service.SignInWithEmailCodeAsync(request);
        Assert.False(first.IsNewAccount);
        await Assert.ThrowsAsync<BadRequestException>(() => service.SignInWithEmailCodeAsync(request));
    }

    [Fact]
    public async Task SignInRemembersTheSiteLanguageForEmails()
    {
        var (service, users, sender) = Create();
        users.Users.Add(new User { User_Id = 4, User_Email = "al@example.com", User_FullName = "Arta", EmailConfirmed = true });

        await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = "al@example.com" });
        await service.SignInWithEmailCodeAsync(new EmailCodeSignInDto { User_Email = "al@example.com", Code = sender.Code, Language = "al" });

        Assert.Equal("al", users.Languages[4]);
    }

    [Fact]
    public async Task WrongCodesLockOutAfterFiveAttempts()
    {
        var (service, users, sender) = Create();
        users.Users.Add(new User { User_Id = 1, User_Email = "a@example.com", EmailConfirmed = true });
        await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = "a@example.com" });
        var wrong = sender.Code == "000000" ? "111111" : "000000";

        for (var i = 0; i < 5; i++)
            await Assert.ThrowsAsync<BadRequestException>(() =>
                service.SignInWithEmailCodeAsync(new EmailCodeSignInDto { User_Email = "a@example.com", Code = wrong }));

        var locked = await Assert.ThrowsAsync<BadRequestException>(() =>
            service.SignInWithEmailCodeAsync(new EmailCodeSignInDto { User_Email = "a@example.com", Code = sender.Code }));
        Assert.Equal("Code expired", locked.Message);
    }

    [Fact]
    public async Task ResendWithinCooldownDoesNotSendAgain()
    {
        var (service, _, sender) = Create();
        await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = "a@example.com" });
        var second = await service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = "a@example.com" });

        Assert.Equal(1, sender.Sent);
        Assert.InRange(second.RetryAfterSeconds, 1, 60);
    }

    [Fact]
    public async Task EmailTooLongForTheColumnIsRejected()
    {
        var (service, _, _) = Create();
        var email = new string('a', 40) + "@example.com";
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.SendSignInCodeAsync(new EmailCodeSendDto { User_Email = email }));
    }

    [Fact]
    public async Task GoogleLinksVerifiedEmailToExistingAccount()
    {
        var google = new FakeVerifier("google", new ExternalIdentity("google", "sub-1", "A@Example.com", true, "Ana"));
        var (service, users, _) = Create(google);
        users.Users.Add(new User { User_Id = 7, User_Email = "a@example.com", User_FullName = "Ana", EmailConfirmed = true });

        var result = await service.ExternalSignInAsync(new ExternalSignInDto { Provider = "google", Token = "good" });

        Assert.Equal(7, result.User.User_Id);
        Assert.False(result.IsNewAccount);
        Assert.True(users.LastSignIn!.Value.AllowLink);
    }

    [Fact]
    public async Task UnverifiedGoogleEmailIsNotUsed()
    {
        var google = new FakeVerifier("google", new ExternalIdentity("google", "sub-1", "a@example.com", false, "Ana"));
        var (service, users, _) = Create(google);

        var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
            service.ExternalSignInAsync(new ExternalSignInDto { Provider = "google", Token = "good" }));
        Assert.Equal("Email required", ex.Message);
        Assert.Null(users.LastSignIn!.Value.Email);
    }

    [Fact]
    public async Task InvalidTokenAndUnknownProviderAreRejected()
    {
        var google = new FakeVerifier("google", new ExternalIdentity("google", "sub-1", "a@example.com", true, "Ana"));
        var (service, _, _) = Create(google);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            service.ExternalSignInAsync(new ExternalSignInDto { Provider = "google", Token = "forged" }));
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.ExternalSignInAsync(new ExternalSignInDto { Provider = "twitter", Token = "good" }));
    }
}
