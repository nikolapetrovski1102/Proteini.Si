using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class EmailSuggestionTests
{
    [Theory]
    [InlineData("andrej@hotmal.com", "andrej@hotmail.com")]
    [InlineData("a@gmial.com", "a@gmail.com")]
    [InlineData("a@gmail.cm", "a@gmail.com")]
    [InlineData("a@gmailcom", "a@gmail.com")]
    [InlineData("a@gmaill.com", "a@gmail.com")]
    [InlineData("a@gmail.ru", "a@gmail.com")]
    [InlineData("a@hormail.com", "a@hotmail.com")]
    [InlineData("a@hotmail.si", "a@hotmail.com")]
    [InlineData("a@yhaoo.com", "a@yahoo.com")]
    [InlineData("a@outlok.com", "a@outlook.com")]
    [InlineData("a@icloud.co", "a@icloud.com")]
    [InlineData("a@protonmail.co", "a@protonmail.com")]
    [InlineData("a@thome.mk", "a@t-home.mk")]
    [InlineData("a@ukim.edu.m", "a@ukim.edu.mk")]
    [InlineData("A@Hotmal.com ", "a@hotmail.com")]
    public void SuggestsTheIntendedProvider(string input, string expected) =>
        Assert.Equal(expected, EmailSuggestions.SuggestEmail(input));

    [Theory]
    [InlineData("a@gmail.com")]
    [InlineData("a@hotmail.de")]
    [InlineData("a@yahoo.co.uk")]
    [InlineData("a@email.com")]
    [InlineData("a@gmx.de")]
    [InlineData("a@o2.pl")]
    [InlineData("a@t-home.mk")]
    [InlineData("a@makpetrol.mk")]
    [InlineData("a@company.com")]
    [InlineData("not-an-email")]
    [InlineData("")]
    public void LeavesRealOrUnknownDomainsAlone(string input) =>
        Assert.Null(EmailSuggestions.SuggestEmail(input));
}

[CollectionDefinition(nameof(EmailDomainCheckerTests), DisableParallelization = true)]
public class EmailDomainCheckerCollection;

[Collection(nameof(EmailDomainCheckerTests))]
public class EmailDomainCheckerTests : IDisposable
{
    public EmailDomainCheckerTests()
    {
        EmailDomainChecker.ClearCache();
        EmailDomainChecker.LookupOverride = (domain, _) => Task.FromResult<bool?>(domain switch
        {
            "hotmal.com" => false,
            "has-mx.example" => true,
            _ => null
        });
    }

    public void Dispose()
    {
        EmailDomainChecker.LookupOverride = null;
        EmailDomainChecker.ClearCache();
    }

    [Fact]
    public async Task RejectsDomainWithoutMailServerAndSuggestsFix()
    {
        var error = await CheckoutFieldValidator.ValidateEmailDomainAsync("andrej@hotmal.com", requireMailServer: true);
        Assert.NotNull(error);
        Assert.Contains("andrej@hotmail.com", error);
    }

    [Fact]
    public async Task AcceptsDomainWithMailServer() =>
        Assert.Null(await CheckoutFieldValidator.ValidateEmailDomainAsync("a@has-mx.example", requireMailServer: true));

    [Fact]
    public async Task FailsOpenWhenDnsCannotAnswer() =>
        Assert.Null(await CheckoutFieldValidator.ValidateEmailDomainAsync("a@unknown.example", requireMailServer: true));

    [Fact]
    public async Task KnownProvidersSkipTheLookup()
    {
        EmailDomainChecker.LookupOverride = (_, _) => Task.FromResult<bool?>(false);
        Assert.Null(await CheckoutFieldValidator.ValidateEmailDomainAsync("a@hotmail.com", requireMailServer: true));
    }
}
