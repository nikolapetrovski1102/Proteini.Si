using System.Globalization;
using System.Net.Mail;
using System.Text;
using ProteiniSi.Contracts.Exceptions;
using ProteiniSi.Contracts.Providers;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Services;

public class MarketingService(IMarketingProvider provider) : IMarketingService
{
    public Task SubscribeAsync(NewsletterSubscriptionDto subscription)
    {
        var email = NormalizeEmail(subscription.Email);
        var source = string.IsNullOrWhiteSpace(subscription.Source) ? "website" : subscription.Source.Trim();
        return provider.SubscribeAsync(email, source);
    }

    public Task UnsubscribeAsync(NewsletterSubscriptionDto subscription) =>
        provider.UnsubscribeAsync(NormalizeEmail(subscription.Email));

    public Task<PagedResult<NewsletterSubscriber>> GetSubscribersAsync(string? search, int page, int pageSize) =>
        provider.GetSubscribersAsync(SearchPattern(search), (page - 1) * pageSize, pageSize);

    public async Task UpdateSubscriberStatusAsync(int id, bool isActive)
    {
        if (!await provider.UpdateSubscriberStatusAsync(id, isActive))
            throw new NotFoundException("Subscriber not found.", new { status = false, message = "Subscriber not found." });
    }

    public Task<PagedResult<MarketingUserSummary>> GetUsersAsync(string? search, int page, int pageSize) =>
        provider.GetUsersAsync(SearchPattern(search), (page - 1) * pageSize, pageSize);

    public async Task<CsvExport> ExportSubscribersAsync()
    {
        var csv = new StringBuilder("Email,Source,Active,Subscribed at\r\n");
        foreach (var row in await provider.GetAllSubscribersAsync())
        {
            csv.Append(Csv(row.Email)).Append(',')
               .Append(Csv(row.Source)).Append(',')
               .Append(row.IsActive ? "Yes" : "No").Append(',')
               .Append(Csv(row.SubscribedAt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)))
               .Append("\r\n");
        }

        return ToCsvExport(csv, $"newsletter-subscribers-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    public async Task<CsvExport> ExportUsersAsync()
    {
        var csv = new StringBuilder("ID,Full name,Email,Phone,Account type,Company,City,Country,Administrator\r\n");
        foreach (var row in await provider.GetAllUsersAsync())
        {
            csv.Append(row.User_Id).Append(',')
               .Append(Csv(row.User_FullName)).Append(',')
               .Append(Csv(row.User_Email)).Append(',')
               .Append(Csv(row.User_Phone)).Append(',')
               .Append(row.User_IsCompany == true ? "Company" : "Individual").Append(',')
               .Append(Csv(row.Company_Name)).Append(',')
               .Append(Csv(row.Company_City)).Append(',')
               .Append(Csv(row.Company_Country)).Append(',')
               .Append(row.SuperAdmin == true ? "Yes" : "No")
               .Append("\r\n");
        }

        return ToCsvExport(csv, $"registered-users-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static string NormalizeEmail(string? value)
    {
        var email = (value ?? string.Empty).Trim().ToLowerInvariant();
        if (!IsValidEmail(email))
            throw new BadRequestException("Enter a valid email address.", new { status = false, message = "Enter a valid email address." });

        return email;
    }

    private static bool IsValidEmail(string email)
    {
        try { return new MailAddress(email).Address == email; }
        catch { return false; }
    }

    private static string? SearchPattern(string? search) =>
        string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";

    private static CsvExport ToCsvExport(StringBuilder csv, string fileName) =>
        new(Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray(), fileName);

    private static string Csv(string? value)
    {
        var text = value ?? string.Empty;
        if (text.Length > 0 && "=+-@\t\r".Contains(text[0]))
            text = "'" + text;
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
