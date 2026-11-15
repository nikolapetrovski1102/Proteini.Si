using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ProteiniSi.Contracts.Services;

namespace ProteiniSi.Services;

/// <summary>
/// Re-applies the automatic discounts shortly after start-up and every 10 minutes, so a discount starts and
/// ends on its dates without anyone opening the admin. Admin changes sync straight away.
/// </summary>
public class DiscountSyncWorker(IServiceScopeFactory scopes, ILogger<DiscountSyncWorker> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            using var timer = new PeriodicTimer(Interval);
            do
            {
                try
                {
                    using var scope = scopes.CreateScope();
                    await scope.ServiceProvider.GetRequiredService<IDiscountService>().SyncAsync();
                }
                catch (Exception ex)
                {
                    // e.g. the discount tables are not deployed yet; try again next time.
                    logger.LogWarning(ex, "Discount sync failed");
                }
            } while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
    }
}
