// ProteiniSi.Api/Models/PaymentRequest.cs
using System.ComponentModel.DataAnnotations;

namespace ProteiniSi.Api.Models
{
    public class PaymentRequest
    {
        [Required]
        public string OrderId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public string Description { get; set; }

        public string CustomerName { get; set; }

        public string CustomerEmail { get; set; }
    }
}