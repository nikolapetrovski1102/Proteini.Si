using System.Reflection;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using ProteiniSi.Api.Controllers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class PasswordHashConfigurationTests
{
    private static byte[] HashWithConfiguredKey(string? key)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:PasswordKey"] = key
            })
            .Build();
        var controller = new UserController(configuration, new HttpContextAccessor());
        var hashMethod = typeof(UserController).GetMethod("GetPasswordHash",
            BindingFlags.Instance | BindingFlags.NonPublic)!;
        var salt = Enumerable.Range(0, 16).Select(value => (byte)value).ToArray();
        return (byte[])hashMethod.Invoke(controller,
            new object[] { "Synthetic-test-password-123!", salt })!;
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
        var wrapper = Assert.Throws<TargetInvocationException>(() => HashWithConfiguredKey(key));
        var error = Assert.IsType<InvalidOperationException>(wrapper.InnerException);
        Assert.Equal("AppSettings:PasswordKey is not configured.", error.Message);
    }
}
