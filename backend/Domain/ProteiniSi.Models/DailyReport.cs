namespace ProteiniSi.Models;

public class SiteEvent
{
    public string? VisitorId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public int? OrderId { get; set; }
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string? Path { get; set; }
    public string? Referrer { get; set; }
}

public class DailyReportSummary
{
    public int Visitors { get; set; }
    public int NewVisitors { get; set; }
    public int PageViews { get; set; }
    public int CartVisitors { get; set; }
    public int CheckoutVisitors { get; set; }
    public int OrderVisitors { get; set; }
    public int CartNoCheckout { get; set; }
    public int CheckoutNoOrder { get; set; }
    public int RegisteredOpenCarts { get; set; }
    public decimal RegisteredOpenCartsValue { get; set; }
    public int NewAccounts { get; set; }
    public int NewAccountsConfirmed { get; set; }
    public int NewsletterSignups { get; set; }
    public int OrdersPlaced { get; set; }
    public int OrdersPaidOnline { get; set; }
    public int OrdersCashOnDelivery { get; set; }
    public int GuestOrders { get; set; }
    public int CardPaymentsNotCompleted { get; set; }
    public decimal CardPaymentsNotCompletedValue { get; set; }
    public decimal Revenue { get; set; }
    public int Customers { get; set; }
    public int ReturningCustomers { get; set; }
}

public class DailyReportOrder
{
    public int Order_Id { get; set; }
    public string? Order_Number { get; set; }
    public DateTime Order_Date { get; set; }
    public string? Billing_FullName { get; set; }
    public string? Billing_City { get; set; }
    public string? Payment_Method { get; set; }
    public string? Payment_Status { get; set; }
    public string? Order_Status { get; set; }
    public decimal Total_Amount { get; set; }
    public bool IsPlaced { get; set; }
}

public class DailyReportProduct
{
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Revenue { get; set; }
}

public class DailyReportSource
{
    public string Source { get; set; } = string.Empty;
    public int Visitors { get; set; }
}

public class DailyReportLead
{
    public int Priority { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public decimal? Value { get; set; }
    public DateTime? LastActivity { get; set; }
}

public class DailyReportData
{
    public DailyReportSummary Summary { get; set; } = new();
    public List<DailyReportOrder> Orders { get; set; } = new();
    public List<DailyReportProduct> TopProducts { get; set; } = new();
    public List<DailyReportSource> Sources { get; set; } = new();
    public List<DailyReportLead> Leads { get; set; } = new();
}

public class DatabaseInfo
{
    public string DatabaseName { get; set; } = string.Empty;
    public decimal? DataMb { get; set; }
    public decimal? LogMb { get; set; }
}
