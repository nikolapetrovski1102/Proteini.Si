using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

public class CPayService(IConfiguration config, ILogger<CPayService> logger) : ICPayService
{
    private static readonly string[] ChecksumFields =
    [
        "AmountToPay", "PayToMerchant", "MerchantName", "AmountCurrency",
        "Details1", "Details2", "PaymentOKURL", "PaymentFailURL",
        "FirstName", "LastName", "Address", "City", "Zip", "Country",
        "Telephone", "Email", "OriginalAmount", "OriginalCurrency"
    ];

    public string GeneratePaymentForm(int orderId, decimal totalAmount, string orderNumber, string customerName, string customerEmail)
    {
        var cpayConfig = config.GetSection("CPayConfiguration");

        var baseUrl = (cpayConfig["Language"] ?? "en-US") switch
        {
            "mk-MK" => "https://vpos.cpay.com.mk/mk-MK",
            "bg-BG" => "https://vpos.cpay.com.mk/bg-BG",
            "sq-AL" => "https://vpos.cpay.com.mk/sq-AL",
            _ => "https://vpos.cpay.com.mk/en-US"
        };

        var successUrl = BuildBackendReturnUrl(cpayConfig["SuccessUrl"], "success");
        var failureUrl = BuildBackendReturnUrl(cpayConfig["FailureUrl"], "failure");
        var payToMerchant = cpayConfig["PayToMerchant"] ?? throw new InvalidOperationException("CPay PayToMerchant is not configured.");
        var merchantName = cpayConfig["MerchantName"] ?? throw new InvalidOperationException("CPay MerchantName is not configured.");

        var parameters = new Dictionary<string, string>
        {
            { "isSimple", "true" },
            { "AmountToPay", ToAmountToPay(totalAmount) },
            { "PayToMerchant", payToMerchant },
            { "MerchantName", merchantName },
            { "AmountCurrency", cpayConfig["Currency"] ?? "MKD" },
            // cPay blocks the client IP on characters outside its whitelist (e.g. '#', quotes), so free text is sanitized.
            { "Details1", SanitizeText($"Order {orderNumber}", 32) },
            { "Details2", orderId.ToString(CultureInfo.InvariantCulture) },
            { "PaymentOKURL", successUrl },
            { "PaymentFailURL", failureUrl }
        };

        var nameParts = SanitizeText(customerName, 129).Split(' ', 2);
        if (nameParts[0].Length > 0)
            parameters.Add("FirstName", Truncate(nameParts[0], 64));
        if (nameParts.Length > 1)
            parameters.Add("LastName", Truncate(nameParts[1], 64));

        if (IsSafeEmail(customerEmail))
            parameters.Add("Email", customerEmail.Trim());

        var checksumHeader = BuildChecksumHeader(parameters);
        var checksum = ComputeChecksum(parameters, checksumHeader, GetSecretKey()
            ?? throw new InvalidOperationException("CPay secret key is not configured."));

        parameters.Add("CheckSumHeader", checksumHeader);
        parameters.Add("CheckSum", checksum);

        return BuildHtmlForm(parameters, baseUrl);
    }

    public bool ProcessCallback(Dictionary<string, string> callbackParams)
    {
        try
        {
            var secretKey = GetSecretKey();
            if (secretKey == null)
            {
                logger.LogWarning("CPay callback rejected: secret key is not configured");
                return false;
            }

            if (!callbackParams.TryGetValue("ReturnCheckSum", out var receivedChecksum) ||
                !callbackParams.TryGetValue("ReturnCheckSumHeader", out var header))
            {
                logger.LogWarning("CPay callback rejected: checksum fields are missing");
                return false;
            }

            var expected = Encoding.ASCII.GetBytes(ComputeChecksum(callbackParams, header, secretKey));
            var received = Encoding.ASCII.GetBytes(receivedChecksum.Trim().ToLowerInvariant());

            if (!CryptographicOperations.FixedTimeEquals(expected, received))
            {
                logger.LogWarning("CPay callback rejected: invalid checksum");
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "CPay callback validation failed");
            return false;
        }
    }

    // cPay requires the amount in denars x 100 with the last two digits always 00, so totals are rounded to whole denars.
    public string ToAmountToPay(decimal totalAmount) =>
        ((long)Math.Round(totalAmount, MidpointRounding.AwayFromZero) * 100).ToString(CultureInfo.InvariantCulture);

    private string? GetSecretKey()
    {
        var secretKey = config["CPayConfiguration:SecretKey"];
        return string.IsNullOrWhiteSpace(secretKey) ? null : secretKey;
    }

    private static string BuildHtmlForm(Dictionary<string, string> parameters, string baseUrl)
    {
        var html = new StringBuilder();

        html.AppendLine("<!DOCTYPE html>");
        html.AppendLine("<html>");
        html.AppendLine("<head>");
        html.AppendLine("<title>Redirecting to payment...</title>");
        html.AppendLine("<style>");
        html.AppendLine("body { font-family: Arial; display:flex; justify-content:center; align-items:center; height:100vh; }");
        html.AppendLine(".spinner { border:4px solid #f3f3f3; border-top:4px solid #2096D8; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; }");
        html.AppendLine("@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}");
        html.AppendLine("</style>");
        html.AppendLine("</head>");
        html.AppendLine("<body onload='document.forms[0].submit()'>");

        html.AppendLine("<div style='text-align:center'>");
        html.AppendLine("<div class='spinner'></div>");
        html.AppendLine("<p>Redirecting to payment...</p>");
        html.AppendLine("</div>");

        html.AppendLine($"<form method='post' action='{baseUrl}'>");

        foreach (var param in parameters)
            html.AppendLine($"<input type='hidden' name='{param.Key}' value='{HtmlEncode(param.Value)}' />");

        html.AppendLine("</form>");
        html.AppendLine("</body>");
        html.AppendLine("</html>");

        return html.ToString();
    }

    public static string BuildChecksumHeader(IReadOnlyDictionary<string, string> parameters)
    {
        var presentParams = new List<string>();
        var lengths = new List<string>();

        foreach (var key in ChecksumFields)
        {
            if (parameters.TryGetValue(key, out var value) && !string.IsNullOrEmpty(value))
            {
                presentParams.Add(key);
                // The spec counts every character as 1 regardless of its UTF-8 byte length.
                lengths.Add(value.Length.ToString("D3"));
            }
        }

        var header = new StringBuilder();
        header.Append(presentParams.Count.ToString("D2"));

        foreach (var p in presentParams)
            header.Append(p).Append(',');

        foreach (var l in lengths)
            header.Append(l);

        return header.ToString();
    }

    public static string ComputeChecksum(IReadOnlyDictionary<string, string> parameters, string header, string secretKey)
    {
        var input = new StringBuilder();
        input.Append(header);

        var count = int.Parse(header[..2]);
        var rest = header[2..];

        var commas = 0;
        var splitIndex = 0;

        for (var i = 0; i < rest.Length; i++)
        {
            if (rest[i] != ',')
                continue;

            commas++;
            if (commas == count)
            {
                splitIndex = i + 1;
                break;
            }
        }

        foreach (var name in rest[..(splitIndex - 1)].Split(','))
        {
            if (parameters.TryGetValue(name, out var value))
                input.Append(value);
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input.ToString()));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    // Keeps letters, digits, single spaces and the separators cPay accepts in text fields.
    private static string SanitizeText(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        var sanitized = new StringBuilder(value.Length);
        foreach (var c in value)
        {
            if (char.IsLetterOrDigit(c) || c is '-' or '/')
                sanitized.Append(c);
            else if (char.IsWhiteSpace(c) && sanitized.Length > 0 && sanitized[^1] != ' ')
                sanitized.Append(' ');
        }

        return Truncate(sanitized.ToString().Trim(), maxLength);
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength].TrimEnd();

    private static bool IsSafeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        email = email.Trim();
        return email.Length <= 256
            && email.Count(c => c == '@') == 1
            && email.All(c => char.IsAsciiLetterOrDigit(c) || c is '@' or '.' or '-' or '_' or '+');
    }

    private static string HtmlEncode(string value) =>
        string.IsNullOrEmpty(value) ? string.Empty : WebUtility.HtmlEncode(value);

    private string BuildBackendReturnUrl(string? configuredUrl, string result)
    {
        var backendBaseUrl = config["AppSettings:BackendUrl"]
            ?? config["AppSettings:PublicBaseUrl"]
            ?? GetOrigin(configuredUrl)
            ?? "https://proteini.mk";

        return $"{backendBaseUrl.TrimEnd('/')}/api/Order/cpay-return/{result}";
    }

    private static string? GetOrigin(string? url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) ? uri.GetLeftPart(UriPartial.Authority) : null;
}
