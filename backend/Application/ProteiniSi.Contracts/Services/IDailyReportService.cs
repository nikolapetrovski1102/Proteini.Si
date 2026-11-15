using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Services;

public interface IDailyReportService
{
    /// <summary>Builds and emails the business report (admins) and the server report (developer).</summary>
    Task<DailyReportResult> RunAsync(DailyReportRequest request, Func<DateTimeOffset, DateTimeOffset, Task<ServerStatusReport>>? collectServerStatus);
}
