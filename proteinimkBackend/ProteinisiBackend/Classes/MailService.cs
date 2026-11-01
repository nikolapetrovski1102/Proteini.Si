using System.Net.Mail;
using System.Net;
using ProteinisiBackend.Models;

namespace ProteinisiBackend.Classes
{
    public class MailService
    {
        private readonly MailModel _mailConfig;

        public MailService(MailModel config)
        {
            _mailConfig = config;
        }

        public async Task SendEmail(List<string> recipients, string subject, string body)
        {
            using var smtpClient = new SmtpClient(_mailConfig.host)
            {
                Port = _mailConfig.SMTPPort,
                Credentials = new NetworkCredential(
                    _mailConfig.sender_username,
                    _mailConfig.sender_password),
                EnableSsl = _mailConfig.EnableSsl
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(
                    _mailConfig.sender_email,
                    _mailConfig.sender_name),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            foreach (var recipient in recipients)
            {
                mailMessage.To.Add(recipient);
            }

            try
            {
                await smtpClient.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                // Log email send error
                System.Diagnostics.Debug.WriteLine($"Email send failed: {ex.Message}");
                throw;
            }
        }
    }

}
