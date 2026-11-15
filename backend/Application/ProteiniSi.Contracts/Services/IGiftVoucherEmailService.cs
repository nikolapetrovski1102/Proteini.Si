namespace ProteiniSi.Contracts.Services;

public interface IGiftVoucherEmailService
{
    /// <summary>Sends the buyer email and, when the buyer named someone else, the gift recipient email. Never throws.</summary>
    Task SendForOrderAsync(int orderId);
}
