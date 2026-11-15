using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IEmailSender
{
    Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody);
    Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody);

    /// <summary>
    /// Marketing email to one person, with a plain-text part and List-Unsubscribe headers (one-click
    /// unsubscribe in Gmail/Yahoo). Implementations without header support fall back to a normal send.
    /// </summary>
    Task<EmailSendResult> SendMarketingAsync(string recipient, string subject, string htmlBody, string textBody, string unsubscribeUrl, string oneClickUnsubscribeUrl) =>
        SendDetailedAsync([recipient], [], subject, htmlBody);
}
