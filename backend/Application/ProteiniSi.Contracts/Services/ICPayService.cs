namespace ProteiniSi.Contracts.Services;

public interface ICPayService
{
    string GeneratePaymentForm(int orderId, decimal totalAmount, string orderNumber, string customerName, string customerEmail);
    bool ProcessCallback(Dictionary<string, string> callbackParams);
    string ToAmountToPay(decimal totalAmount);
}
