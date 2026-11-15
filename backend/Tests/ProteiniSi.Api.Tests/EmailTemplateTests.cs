using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class EmailTemplateTests
{
    public static TheoryData<string, string> Templates() => new()
    {
        { "verify", VerificationEmailTemplate.Build("Ana", "123456", 15, "mk").Html },
        { "verify-al", VerificationEmailTemplate.Build("Ana", "123456", 15, "al").Html },
        { "checkout", VerificationEmailTemplate.BuildCheckout("Ana", "123456", 15, "mk").Html },
        { "sign-in", VerificationEmailTemplate.BuildSignIn("123456", 15, "mk").Html },
        { "reset", VerificationEmailTemplate.BuildPasswordReset("https://proteini.mk/reset-password?token=abc", "mk").Html },
        { "reset-al", VerificationEmailTemplate.BuildPasswordReset("https://proteini.mk/reset-password?token=abc", "al").Html },
    };

    [Theory]
    [MemberData(nameof(Templates))]
    public void EveryTemplateUsesTheBrandedLayout(string name, string html)
    {
        Assert.Contains(EmailLayout.BannerUrl, html);
        Assert.Contains(EmailLayout.Yellow, html);
        Assert.Contains("info@proteini.mk", html);
        Assert.False(html.Contains("2096D8", StringComparison.OrdinalIgnoreCase), $"{name} still uses the old blue");
        // Single quotes inside the single-quoted style attributes would break the font stack.
        Assert.DoesNotContain("'Arial Narrow'", html);
    }

    [Fact]
    public void PasswordResetUsesRequestedLanguageAndEncodesLink()
    {
        var (mkSubject, mkHtml) = VerificationEmailTemplate.BuildPasswordReset("https://proteini.mk/reset-password?token=a&b", "mk");
        var (alSubject, _) = VerificationEmailTemplate.BuildPasswordReset("https://proteini.mk/reset-password?token=a&b", "al");

        Assert.Equal("Промена на лозинка", mkSubject);
        Assert.Equal("Ndryshimi i fjalëkalimit", alSubject);
        Assert.Contains("token=a&amp;b", mkHtml);
        Assert.DoesNotContain("token=a&b", mkHtml);
    }

    [Fact]
    public void StatusLabelUsesArcUnderlineInsteadOfPill()
    {
        var yellow = EmailLayout.Badge("Paid", EmailLayout.Tone.Yellow);
        var ink = EmailLayout.Badge("Test", EmailLayout.Tone.Ink);

        Assert.Contains("/img/email/arc-yellow.png", yellow);
        Assert.Contains("/img/email/arc-ink.png", ink);
        Assert.DoesNotContain("border-radius:999px", yellow);
    }

    [Theory]
    [InlineData("proteini-banner.png")]
    [InlineData("arc-yellow.png")]
    [InlineData("arc-ink.png")]
    public void EmailImagesShipWithTheFrontend(string file)
    {
        // The emails load these from proteini.mk, so they must be in the frontend's public folder.
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, "frontend", "public")))
            dir = dir.Parent;

        Assert.NotNull(dir);
        Assert.True(File.Exists(Path.Combine(dir!.FullName, "frontend", "public", "img", "email", file)), $"Missing frontend/public/img/email/{file}");
    }
}
