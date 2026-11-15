using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;
using Xunit;

namespace ProteiniSi.Api.Tests;

public class CheckoutFieldValidatorTests
{
    [Theory]
    [InlineData("070123456", "070123456")]
    [InlineData("070 123 456", "070123456")]
    [InlineData("074-607-257", "074607257")]
    [InlineData("078 229-924 ", "078229924")]
    [InlineData("+389 78215526", "078215526")]
    [InlineData("+38977841494", "077841494")]
    [InlineData("00389 70 123 456", "070123456")]
    [InlineData("71656559", "071656559")]
    [InlineData("02 3123 456", "023123456")]
    public void AcceptsMacedonianNumbers(string input, string expected) =>
        Assert.Equal(expected, CheckoutFieldValidator.NormalizeMacedonianPhone(input));

    // Taken from the fake orders on production.
    [Theory]
    [InlineData("640045331")]
    [InlineData("0887451223")]
    [InlineData("726299928")]
    [InlineData("35987620028")]
    [InlineData("+95557296311")]
    [InlineData("+30199876920")]
    [InlineData("8277619200")]
    [InlineData("41777782761")]
    [InlineData("123123123")]
    [InlineData("test")]
    [InlineData("")]
    [InlineData(null)]
    public void RejectsForeignOrJunkNumbers(string? input) =>
        Assert.Null(CheckoutFieldValidator.NormalizeMacedonianPhone(input));

    [Theory]
    [InlineData("+389 71 000 000", "+38971000000")]
    [InlineData("+389 071 000 000", "+38971000000")]
    [InlineData("071 000 000", "+38971000000")]
    [InlineData("71 000 000", "+38971000000")]
    [InlineData("00389 70 123 456", "+38970123456")]
    [InlineData("+381 64 123 4567", "+381641234567")]
    [InlineData("+381 064 123 4567", "+381641234567")]
    [InlineData("+355 69 123 4567", "+355691234567")]
    [InlineData("+383 44 123 456", "+38344123456")]
    [InlineData("+359 88 123 4567", "+359881234567")]
    [InlineData("+30 691 234 5678", "+306912345678")]
    [InlineData("+49 151 2345 6789", "+4915123456789")]
    [InlineData("+41 79 123 45 67", "+41791234567")]
    public void NormalizesAllowedCountryPhonesToE164(string input, string expected) =>
        Assert.Equal(expected, CheckoutFieldValidator.NormalizePhone(input));

    [Theory]
    [InlineData("+389 81 123 456")]   // invalid MK area/mobile prefix (must start with 2-7)
    [InlineData("+389 71 123 45")]    // too short for MK (7 digits instead of 8)
    [InlineData("+389 71 123 4567")]  // too long for MK (9 digits instead of 8)
    [InlineData("+389 77 777 777")]   // repeated identical digits
    [InlineData("+999 71 123 456")]   // unknown/disallowed country prefix
    [InlineData("12345")]
    [InlineData("")]
    [InlineData(null)]
    public void RejectsInvalidCountryPhones(string? input) =>
        Assert.Null(CheckoutFieldValidator.NormalizePhone(input));

    [Fact]
    public void RespectsAllowPhoneFlagOnCountryRule()
    {
        var countries = new List<CountryRule>
        {
            new() { CountryId = 1, Iso2 = "MK", DialCode = "389", PhoneMinDigits = 8, PhoneMaxDigits = 8, PhonePattern = "^[2-7][0-9]{7}$", StripLeadingZero = true, AllowPhone = true },
            new() { CountryId = 2, Iso2 = "RS", DialCode = "381", PhoneMinDigits = 8, PhoneMaxDigits = 9, StripLeadingZero = true, AllowPhone = false }
        };

        Assert.Equal("+38971000000", CheckoutFieldValidator.NormalizePhone("+389 071 000 000", countries));
        Assert.Null(CheckoutFieldValidator.NormalizePhone("+381 64 123 4567", countries));
    }

    [Fact]
    public void ValidatesCityAndPostCodeAgainstDeliverFlagAndPostCodes()
    {
        var cities = new List<CityLookup>
        {
            new()
            {
                CityId = 1,
                NameLatin = "Skopje",
                NameMk = "Скопје",
                Deliver = true,
                PostCodes =
                [
                    new() { PostCode = "1000", PostOffice = "Skopje" },
                    new() { PostCode = "1020", PostOffice = "Skopje-Karpos 3" }
                ]
            },
            new()
            {
                CityId = 2,
                NameLatin = "Kuceviste",
                NameMk = "Кучевиште",
                Deliver = false,
                PostCodes = [new() { PostCode = "1011", PostOffice = "Kuceviste" }]
            }
        };

        var okLatin = CheckoutFieldValidator.ValidateCityAndPostCode("Skopje", "1020", cities);
        Assert.True(okLatin.IsValid);
        Assert.Equal("Skopje", okLatin.CanonicalCity);
        Assert.Equal("1020", okLatin.CanonicalPostCode);

        var okCyrillic = CheckoutFieldValidator.ValidateCityAndPostCode("Скопје", "1000", cities);
        Assert.True(okCyrillic.IsValid);
        Assert.Equal("Skopje", okCyrillic.CanonicalCity);

        var wrongZip = CheckoutFieldValidator.ValidateCityAndPostCode("Skopje", "7000", cities);
        Assert.False(wrongZip.IsValid);

        var disabledCity = CheckoutFieldValidator.ValidateCityAndPostCode("Kuceviste", "1011", cities);
        Assert.False(disabledCity.IsValid);
    }

    [Theory]
    [InlineData("user@gmail.com", true, null)]
    [InlineData("user@gmial.com", false, "user@gmail.com")]
    [InlineData("user@hotmial.com", false, "user@hotmail.com")]
    [InlineData("invalid-email", false, null)]
    public void ValidatesEmailAndDetectsTypos(string input, bool expectedValid, string? expectedSuggestion)
    {
        var result = CheckoutFieldValidator.ValidateEmail(input);
        Assert.Equal(expectedValid, result.IsValid);
        Assert.Equal(expectedSuggestion, result.SuggestedEmail);
    }

    [Theory]
    [InlineData("1000", true)]
    [InlineData(" 7500 ", true)]
    [InlineData("1250", true)]
    [InlineData("8217", false)]
    [InlineData("9100", false)]
    [InlineData("72738", false)]
    [InlineData("10", false)]
    [InlineData("0123", false)]
    [InlineData("test", false)]
    [InlineData(null, false)]
    public void ValidatesPostCodes(string? input, bool expected) =>
        Assert.Equal(expected, CheckoutFieldValidator.IsValidPostCode(input));

    [Theory]
    [InlineData("Tressscript Hacken 3.0")]
    [InlineData("Uber Script 8.1 ")]
    [InlineData("Hackscriot 8.0 wingbair")]
    [InlineData("see https://example.com")]
    [InlineData("www.example.com")]
    public void RejectsAdvertNotes(string note) =>
        Assert.NotNull(CheckoutFieldValidator.CheckNote(note));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("Достава на Меѓународен Аеродром, Петровец")]
    [InlineData("Belicica 89 Gostivar")]
    [InlineData("Јавете се на бројот за да ја потврдите адресата")]
    public void AcceptsNormalNotes(string? note) =>
        Assert.Null(CheckoutFieldValidator.CheckNote(note));

    [Fact]
    public void RejectsOverlongNotes() =>
        Assert.NotNull(CheckoutFieldValidator.CheckNote(new string('a', CheckoutFieldValidator.MaxNoteLength + 1)));
}
