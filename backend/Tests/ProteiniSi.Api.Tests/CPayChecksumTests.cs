using ProteiniSi.Services;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class CPayChecksumTests
{
    private static Dictionary<string, string> SpecExampleParameters(string details1) => new()
    {
        ["AmountToPay"] = "1300",
        ["PayToMerchant"] = "1000000047",
        ["MerchantName"] = "MKPAYMK1",
        ["AmountCurrency"] = "MKD",
        ["Details1"] = details1,
        ["Details2"] = "123456789",
        ["PaymentOKURL"] = "http://merchantOKurl.com",
        ["PaymentFailURL"] = "http://merchantFailurl.com",
        ["FirstName"] = "Dejan",
        ["LastName"] = "Pavlovic",
        ["Address"] = "Orce Nikolov 71",
        ["City"] = "Skopje",
        ["Zip"] = "1000",
        ["Country"] = "807",
        ["Telephone"] = "+389 2 125 495",
        ["Email"] = "filmfest@mol.com.mk",
        ["OriginalAmount"] = "150",
        ["OriginalCurrency"] = "EUR"
    };

    private const string SpecHeader =
        "18AmountToPay,PayToMerchant,MerchantName,AmountCurrency,Details1,Details2,PaymentOKURL,PaymentFailURL," +
        "FirstName,LastName,Address,City,Zip,Country,Telephone,Email,OriginalAmount,OriginalCurrency," +
        "004010008003012009024026005008015006004003014019003003";

    [Fact]
    public void BuildsHeaderFromSpecExample()
    {
        Assert.Equal(SpecHeader, CPayService.BuildChecksumHeader(SpecExampleParameters("Invoice 1000")));
    }

    [Fact]
    public void ComputesSpecExampleChecksumAsHmacSha256()
    {
        // The spec's published input string hashes "Invoice1000" even though its header declares length 012.
        var checksum = CPayService.ComputeChecksum(SpecExampleParameters("Invoice1000"), SpecHeader, "TEST_PASS");
        Assert.Equal("aa535a028a74cb1b86429cdeb221f1b1d8955eedcb8ddc56ee030c4d40fbeb4e", checksum);
    }

    [Fact]
    public void CountsMultiByteCharactersAsOne()
    {
        var header = CPayService.BuildChecksumHeader(new Dictionary<string, string> { ["FirstName"] = "Никола" });
        Assert.Equal("01FirstName,006", header);
    }
}
