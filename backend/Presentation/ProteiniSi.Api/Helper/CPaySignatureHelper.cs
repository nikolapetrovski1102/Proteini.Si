using System.Security.Cryptography;
using System.Text;
using System.Linq;

namespace ProteiniSi.Api.Helpers
{
    public class CPaySignatureHelper
    {
        public static string GenerateSignature(SortedDictionary<string, string> parameters, string secretKey)
        {
            // Create string to sign: key1=value1&key2=value2&...&secret_key
            var stringToSign = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));
            stringToSign += $"&secret_key={secretKey}";

            // Generate HMAC-SHA256 signature
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }

        public static bool VerifySignature(SortedDictionary<string, string> parameters, string secretKey, string receivedSignature)
        {
            var calculatedSignature = GenerateSignature(parameters, secretKey);
            return calculatedSignature == receivedSignature;
        }

        public static string GenerateRandomOrderId()
        {
            return $"ORD_{DateTime.Now.Ticks}_{new Random().Next(1000, 9999)}";
        }
    }
}