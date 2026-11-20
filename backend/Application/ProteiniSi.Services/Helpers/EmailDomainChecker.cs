using System.Collections.Concurrent;
using DnsClient;
using DnsClient.Protocol;

namespace ProteiniSi.Services.Helpers;

/// <summary>
/// Checks that an email domain has a mail server (MX record). hotmal.com, gmial.com and gmal.com
/// exist as websites but have no MX, so mail to them never arrives.
/// Answers are cached; DNS failures and timeouts "fail open" (null) so a DNS outage never blocks a customer.
/// </summary>
public static class EmailDomainChecker
{
    private static readonly TimeSpan PositiveTtl = TimeSpan.FromHours(12);
    private static readonly TimeSpan NegativeTtl = TimeSpan.FromHours(1);
    private static readonly ConcurrentDictionary<string, (bool CanReceive, DateTime ExpiresAt)> Cache = new(StringComparer.OrdinalIgnoreCase);

    private static readonly LookupClient Client = new(new LookupClientOptions
    {
        Timeout = TimeSpan.FromMilliseconds(1500),
        Retries = 1,
        UseCache = true,
        ThrowDnsErrors = false
    });

    /// <summary>Replaces the DNS lookup in tests.</summary>
    public static Func<string, CancellationToken, Task<bool?>>? LookupOverride { get; set; }

    public static void ClearCache() => Cache.Clear();

    /// <summary>True: has a mail server. False: no such domain, no MX, or a "null MX". Null: could not tell.</summary>
    public static async Task<bool?> CanReceiveMailAsync(string domain, CancellationToken cancellationToken = default)
    {
        domain = domain.Trim().TrimEnd('.').ToLowerInvariant();
        if (domain.Length == 0)
            return false;

        if (Cache.TryGetValue(domain, out var cached) && cached.ExpiresAt > DateTime.UtcNow)
            return cached.CanReceive;

        var answer = LookupOverride != null
            ? await LookupOverride(domain, cancellationToken)
            : await LookupAsync(domain, cancellationToken);

        if (answer.HasValue)
            Cache[domain] = (answer.Value, DateTime.UtcNow + (answer.Value ? PositiveTtl : NegativeTtl));

        return answer;
    }

    private static async Task<bool?> LookupAsync(string domain, CancellationToken cancellationToken)
    {
        try
        {
            var result = await Client.QueryAsync(domain, QueryType.MX, cancellationToken: cancellationToken);
            if (result.Header.ResponseCode == DnsHeaderResponseCode.NotExistentDomain)
                return false;
            if (result.HasError)
                return null;

            var mx = result.Answers.MxRecords().ToList();
            if (mx.Count == 0)
                return false;

            // RFC 7505 "null MX" (a single "." exchange) means the domain accepts no mail.
            return mx.Any(record => record.Exchange.Value.Trim('.').Length > 0);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return null;
        }
        catch (DnsResponseException)
        {
            return null;
        }
    }
}
