namespace ProteinisiBackend.Models
{
    public class CPayCallbackModel
    {
        public string shop_id { get; set; }
        public string order_id { get; set; }
        public string transaction_id { get; set; }
        public decimal amount { get; set; }
        public string currency { get; set; }
        public string payment_status { get; set; }
        public string signature { get; set; }
        public DateTime timestamp { get; set; }
        public string card_brand { get; set; }
        public string card_last4 { get; set; }
    }
}