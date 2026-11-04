namespace ProteiniSi.Contracts.Services;

public interface ICPayService
{
    string GeneratePaymentForm(int orderId, int amount, string orderNumber, string customerName, string customerEmail);
    bool ProcessCallback(Dictionary<string, string> callbackParams);
}
