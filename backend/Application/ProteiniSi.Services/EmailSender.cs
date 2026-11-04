using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Models;
using ProteiniSi.Services.Helpers;

namespace ProteiniSi.Services;

public class EmailSender(IConfiguration config, ILogger<EmailSender> logger) : IEmailSender
{
    public async Task SendAsync(IEnumerable<string?> recipients, string subject, string htmlBody)
    {
        var mail = CreateMailModel(recipients, subject, htmlBody);

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(mail.sender_name, mail.sender_email));

            foreach (var recipient in mail.ToRecipients)
                message.To.Add(MailboxAddress.Parse(recipient));

            message.Subject = mail.subject;
            message.Body = new BodyBuilder { HtmlBody = mail.content }.ToMessageBody();

            using var client = new SmtpClient();
            client.CheckCertificateRevocation = mail.CheckCertificateRevocation;

            await client.ConnectAsync(mail.host, mail.SMTPPort, GetSocketOptions(mail));
            await client.AuthenticateAsync(mail.sender_username, mail.sender_password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending email \"{Subject}\"", subject);
        }
    }

    public async Task<EmailSendResult> SendDetailedAsync(IReadOnlyCollection<string> recipients, IReadOnlyCollection<string> ccRecipients, string subject, string htmlBody)
    {
        if (recipients.Count == 0)
            throw new InvalidOperationException("At least one email recipient is required.");

        var mail = CreateMailModel(recipients, subject, htmlBody);
        mail.CcRecipients = ccRecipients.ToList();

        var startedAt = DateTime.UtcNow;
        var result = CreateResult(mail, startedAt);

        try
        {
            if (string.IsNullOrWhiteSpace(mail.host))
                throw new InvalidOperationException("SMTP host is empty.");
            if (string.IsNullOrWhiteSpace(mail.sender_username))
                throw new InvalidOperationException("SMTP sender username is empty.");
            if (string.IsNullOrWhiteSpace(mail.sender_email))
                throw new InvalidOperationException("SMTP sender email is empty.");
            if (string.IsNullOrWhiteSpace(mail.sender_password))
                throw new InvalidOperationException("SMTP sender password is empty.");
            if (mail.ToRecipients.Count == 0)
                throw new InvalidOperationException("No email recipients were provided.");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(mail.sender_name, mail.sender_email));

            foreach (var recipient in mail.ToRecipients)
                message.To.Add(MailboxAddress.Parse(recipient));

            foreach (var recipient in mail.CcRecipients)
                message.Cc.Add(MailboxAddress.Parse(recipient));

            message.Subject = mail.subject;
            message.Body = new BodyBuilder { HtmlBody = mail.content }.ToMessageBody();

            using var client = new SmtpClient();
            client.CheckCertificateRevocation = mail.CheckCertificateRevocation;

            await client.ConnectAsync(mail.host, mail.SMTPPort, GetSocketOptions(mail));
            await client.AuthenticateAsync(mail.sender_username, mail.sender_password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            result.Success = true;
            result.CompletedAtUtc = DateTime.UtcNow;
            result.DurationMs = (long)(result.CompletedAtUtc.Value - startedAt).TotalMilliseconds;
            result.Message = "SMTP send completed with authenticated MailKit SMTP. This means the provider accepted the message, not necessarily inbox delivery.";
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending email \"{Subject}\" to {Recipients}", subject, string.Join(", ", result.Recipients));

            var failure = CreateResult(mail, DateTime.UtcNow);
            failure.CompletedAtUtc = failure.StartedAtUtc;
            failure.Message = ex.Message;
            failure.ExceptionType = ex.GetType().FullName;
            failure.InnerExceptionType = ex.InnerException?.GetType().FullName;
            failure.InnerExceptionMessage = ex.InnerException?.Message;
            return failure;
        }
    }

    private static EmailSendResult CreateResult(MailModel mail, DateTime startedAt) => new()
    {
        Host = mail.host,
        Port = mail.SMTPPort,
        EnableSsl = mail.EnableSsl,
        SenderEmail = EmailMask.Mask(mail.sender_email),
        SenderUsername = EmailMask.Mask(mail.sender_username),
        RecipientCount = mail.ToRecipients.Count,
        Recipients = MaskAll(mail.ToRecipients),
        CcRecipientCount = mail.CcRecipients.Count,
        CcRecipients = MaskAll(mail.CcRecipients),
        Subject = mail.subject,
        StartedAtUtc = startedAt
    };

    private static List<string> MaskAll(IEnumerable<string> emails) =>
        emails.Select(EmailMask.Mask).Where(value => value != null).Cast<string>().ToList();

    private MailModel CreateMailModel(IEnumerable<string?> recipients, string subject, string body)
    {
        var settings = config.GetSection("MailSettings");

        return new MailModel
        {
            SMTPPort = settings.GetValue<int?>("SMTPPort") ?? 587,
            host = settings["host"] ?? throw new InvalidOperationException("MailSettings:host is not configured."),
            sender_username = settings["sender_username"] ?? throw new InvalidOperationException("MailSettings:sender_username is not configured."),
            sender_email = settings["sender_email"] ?? throw new InvalidOperationException("MailSettings:sender_email is not configured."),
            sender_name = settings["sender_name"] ?? "Proteini.mk",
            sender_password = settings["sender_password"] ?? throw new InvalidOperationException("MailSettings:sender_password is not configured."),
            EnableSsl = settings.GetValue<bool?>("EnableSsl") ?? true,
            CheckCertificateRevocation = settings.GetValue<bool?>("CheckCertificateRevocation") ?? true,
            ToRecipients = recipients.Where(r => !string.IsNullOrWhiteSpace(r)).Select(r => r!).ToList(),
            content = body,
            subject = subject
        };
    }

    private static SecureSocketOptions GetSocketOptions(MailModel mail) =>
        mail.EnableSsl
            ? (mail.SMTPPort == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls)
            : SecureSocketOptions.None;
}
