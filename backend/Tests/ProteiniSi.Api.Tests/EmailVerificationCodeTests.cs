using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class EmailVerificationCodeTests
{
    private const string Key = "synthetic-email-code-test-key";

    [Fact]
    public void GeneratedCodesAreSixDigits()
    {
        for (var i = 0; i < 200; i++)
        {
            var code = EmailVerificationCode.Generate();
            Assert.Equal(6, code.Length);
            Assert.All(code, c => Assert.True(char.IsAsciiDigit(c)));
        }
    }

    [Fact]
    public void HashIsBoundToUserAndCode()
    {
        var hash = EmailVerificationCode.Hash(42, "123456", Key);

        Assert.True(EmailVerificationCode.Matches(hash, EmailVerificationCode.Hash(42, "123456", Key)));
        Assert.False(EmailVerificationCode.Matches(hash, EmailVerificationCode.Hash(43, "123456", Key)));
        Assert.False(EmailVerificationCode.Matches(hash, EmailVerificationCode.Hash(42, "123457", Key)));
        Assert.False(EmailVerificationCode.Matches(hash, EmailVerificationCode.Hash(42, "123456", Key + "x")));
    }

    [Fact]
    public void MissingStoredHashNeverMatches()
    {
        var candidate = EmailVerificationCode.Hash(1, "000000", Key);
        Assert.False(EmailVerificationCode.Matches(null, candidate));
        Assert.False(EmailVerificationCode.Matches([], candidate));
    }

    [Theory]
    [InlineData("123456", "123456")]
    [InlineData(" 123 456 ", "123456")]
    [InlineData("123-456", "123456")]
    [InlineData("12345", null)]
    [InlineData("1234567", null)]
    [InlineData("12a456", null)]
    [InlineData("١٢٣٤٥٦", null)]
    [InlineData(null, null)]
    public void NormalizeAcceptsOnlySixAsciiDigits(string? input, string? expected) =>
        Assert.Equal(expected, EmailVerificationCode.Normalize(input));

    [Fact]
    public void BlankKeyIsRejected() =>
        Assert.Throws<InvalidOperationException>(() => EmailVerificationCode.Hash(1, "123456", " "));

    [Fact]
    public void TemplateUsesRequestedLanguageAndEncodesName()
    {
        var (mkSubject, mkHtml) = VerificationEmailTemplate.Build("<Ana>", "654321", 15, "mk");
        var (alSubject, _) = VerificationEmailTemplate.Build("Ana", "654321", 15, "al");

        Assert.Contains("654321", mkSubject);
        Assert.Contains("Kodi", alSubject);
        Assert.Contains("&lt;Ana&gt;", mkHtml);
        Assert.DoesNotContain("<Ana>", mkHtml);
    }
}
