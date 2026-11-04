using System.Text.Json.Serialization;

namespace ProteiniSi.Models;

public class MarketingUser
{
    [JsonPropertyName("User_Id")] public int User_Id { get; set; }
    [JsonPropertyName("User_FullName")] public string? User_FullName { get; set; }
    [JsonPropertyName("User_Email")] public string User_Email { get; set; } = string.Empty;
    [JsonPropertyName("User_Phone")] public string? User_Phone { get; set; }
    [JsonPropertyName("User_IsCompany")] public bool? User_IsCompany { get; set; }
    [JsonPropertyName("Company_Name")] public string? Company_Name { get; set; }
    [JsonPropertyName("Company_City")] public string? Company_City { get; set; }
    [JsonPropertyName("Company_Country")] public string? Company_Country { get; set; }
    [JsonPropertyName("SuperAdmin")] public bool? SuperAdmin { get; set; }
}

public class MarketingUserSummary : MarketingUser
{
    [JsonPropertyName("OrderCount")] public int OrderCount { get; set; }
    [JsonPropertyName("LifetimeOrderValue")] public decimal LifetimeOrderValue { get; set; }
    [JsonPropertyName("LastOrderAt")] public DateTime? LastOrderAt { get; set; }
}
