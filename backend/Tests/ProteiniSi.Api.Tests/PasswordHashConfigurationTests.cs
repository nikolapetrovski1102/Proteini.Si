using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class PasswordHashConfigurationTests
{
    private static byte[] HashWithConfiguredKey(string? key)
    {
        var salt = Enumerable.Range(0, 16).Select(value => (byte)value).ToArray();
        return PasswordHasher.Hash("Synthetic-test-password-123!", salt, key);
    }

    [Fact]
    public void ConfiguredKeyPreservesExistingPasswordHashFormat()
    {
        // Independent PBKDF2-SHA256 fixture with a synthetic key, 1,000,000 rounds,
        // and the legacy ASCII(key + Base64(salt)) salt format.
        var actual = HashWithConfiguredKey("handover-regression-test-key");
        Assert.Equal("746E9E75E357FFD8F9770D474188E518C016F881EAB4E21A3C055A534EDF9ACC",
            Convert.ToHexString(actual));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void MissingOrBlankKeyIsRejected(string? key)
    {
        var error = Assert.Throws<InvalidOperationException>(() => HashWithConfiguredKey(key));
        Assert.Equal("AppSettings:PasswordKey is not configured.", error.Message);
    }
}
