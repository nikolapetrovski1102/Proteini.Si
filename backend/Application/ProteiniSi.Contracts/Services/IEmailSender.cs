using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IEmailSender
{
    Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody);
    Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody);
}
