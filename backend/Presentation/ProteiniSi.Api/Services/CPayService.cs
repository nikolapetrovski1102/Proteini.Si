using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace ProteiniSi.Api.Services
{
    public class CPayService
    {
        private readonly IConfiguration _configuration;

        public CPayService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GeneratePaymentForm(int orderId, int amount, string orderNumber, string customerName, string customerEmail)
        {
            var cpayConfig = _configuration.GetSection("CPayConfiguration");

            int amountToPay = amount;

            string language = cpayConfig["Language"] ?? "en-US";
            string baseUrl = language switch
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
                { "AmountToPay", amountToPay.ToString() },
                { "PayToMerchant", payToMerchant },
                { "MerchantName", merchantName },
                { "AmountCurrency", cpayConfig["Currency"] ?? "MKD" },
                { "Details1", $"Order #{orderNumber}" },
                { "Details2", orderId.ToString() },
                { "PaymentOKURL", successUrl },
                { "PaymentFailURL", failureUrl }
            };

            // Optional customer data
            if (!string.IsNullOrEmpty(customerName))
            {
                var nameParts = customerName.Split(' ', 2);
                parameters.Add("FirstName", nameParts[0]);

                if (nameParts.Length > 1)
                    parameters.Add("LastName", nameParts[1]);
            }

            if (!string.IsNullOrEmpty(customerEmail))
                parameters.Add("Email", customerEmail);

            // Generate checksum
            var checksumHeader = GenerateChecksumHeader(parameters);
            var checksum = GenerateChecksum(parameters, checksumHeader);

            parameters.Add("CheckSumHeader", checksumHeader);
            parameters.Add("CheckSum", checksum);

            // 🔍 DEBUG (remove later)
            Console.WriteLine("---- CPAY REQUEST ----");
            foreach (var p in parameters)
                Console.WriteLine($"{p.Key}: {p.Value}");
            Console.WriteLine($"Header: {checksumHeader}");
            Console.WriteLine($"Checksum: {checksum}");

            return BuildHtmlForm(parameters, baseUrl);
        }

        private string BuildHtmlForm(Dictionary<string, string> parameters, string baseUrl)
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
            {
                html.AppendLine($"<input type='hidden' name='{param.Key}' value='{HtmlEncode(param.Value)}' />");
            }

            html.AppendLine("</form>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private string GenerateChecksumHeader(Dictionary<string, string> parameters)
        {
            string[] orderedParams = {
                "AmountToPay", "PayToMerchant", "MerchantName", "AmountCurrency",
                "Details1", "Details2", "PaymentOKURL", "PaymentFailURL",
                "FirstName", "LastName", "Address", "City", "Zip", "Country",
                "Telephone", "Email", "OriginalAmount", "OriginalCurrency"
            };

            var presentParams = new List<string>();
            var lengths = new List<string>();

            foreach (var key in orderedParams)
            {
                if (parameters.ContainsKey(key) && !string.IsNullOrEmpty(parameters[key]))
                {
                    presentParams.Add(key);
                    lengths.Add(Encoding.UTF8.GetByteCount(parameters[key]).ToString("D3"));
                }
            }

            var header = new StringBuilder();
            header.Append(presentParams.Count.ToString("D2"));

            foreach (var p in presentParams)
                header.Append(p).Append(",");

            foreach (var l in lengths)
                header.Append(l);

            return header.ToString();
        }

        private string GenerateChecksum(Dictionary<string, string> parameters, string header)
        {
            var secretKey = _configuration["CPayConfiguration:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
                throw new InvalidOperationException("CPay secret key is not configured.");

            var input = new StringBuilder();
            input.Append(header);

            int count = int.Parse(header.Substring(0, 2));
            string rest = header.Substring(2);

            int commas = 0;
            int splitIndex = 0;

            for (int i = 0; i < rest.Length; i++)
            {
                if (rest[i] == ',')
                {
                    commas++;
                    if (commas == count)
                    {
                        splitIndex = i + 1;
                        break;
                    }
                }
            }

            var names = rest.Substring(0, splitIndex - 1).Split(',');

            foreach (var name in names)
            {
                if (parameters.ContainsKey(name))
                    input.Append(parameters[name]);
            }

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input.ToString()));
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }

        public bool ProcessCallback(Dictionary<string, string> callbackParams)
        {
            try
            {
                var secretKey = _configuration["CPayConfiguration:SecretKey"];
                if (string.IsNullOrWhiteSpace(secretKey))
                {
                    Console.WriteLine("Missing CPay secret key");
                    return false;
                }

                if (!callbackParams.ContainsKey("ReturnCheckSum") ||
                    !callbackParams.ContainsKey("ReturnCheckSumHeader"))
                {
                    Console.WriteLine("Missing checksum fields");
                    return false;
                }

                string receivedChecksum = callbackParams["ReturnCheckSum"];
                string header = callbackParams["ReturnCheckSumHeader"];

                var input = new StringBuilder();
                input.Append(header);

                int count = int.Parse(header.Substring(0, 2));
                string rest = header.Substring(2);

                int commas = 0;
                int splitIndex = 0;

                for (int i = 0; i < rest.Length; i++)
                {
                    if (rest[i] == ',')
                    {
                        commas++;
                        if (commas == count)
                        {
                            splitIndex = i + 1;
                            break;
                        }
                    }
                }

                var names = rest.Substring(0, splitIndex - 1).Split(',');

                foreach (var name in names)
                {
                    if (callbackParams.ContainsKey(name))
                        input.Append(callbackParams[name]);
                }

                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
                {
                    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(input.ToString()));
                    var expected = BitConverter.ToString(hash).Replace("-", "").ToLower();

                    if (expected != receivedChecksum)
                    {
                        Console.WriteLine($"Invalid checksum! Expected: {expected}, Got: {receivedChecksum}");
                        return false;
                    }
                }

                Console.WriteLine("Callback validated successfully");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Callback error: {ex.Message}");
                return false;
            }
        }

        private string HtmlEncode(string value)
        {
            return string.IsNullOrEmpty(value)
                ? string.Empty
                : System.Net.WebUtility.HtmlEncode(value);
        }

        private string BuildBackendReturnUrl(string? configuredUrl, string result)
        {
            var backendBaseUrl = _configuration["AppSettings:BackendUrl"]
                ?? _configuration["AppSettings:PublicBaseUrl"]
                ?? GetOrigin(configuredUrl)
                ?? "https://proteini.mk";

            return $"{backendBaseUrl.TrimEnd('/')}/api/Order/cpay-return/{result}";
        }

        private static string? GetOrigin(string? url)
        {
            if (Uri.TryCreate(url, UriKind.Absolute, out var uri))
                return uri.GetLeftPart(UriPartial.Authority);

            return null;
        }
    }
}
