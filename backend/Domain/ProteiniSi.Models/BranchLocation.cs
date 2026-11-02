namespace ProteiniSi.Models;

public class BranchLocation
{
    public int Id { get; set; }
    public string Type { get; set; } = "shop";
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHoursMonFri { get; set; } = string.Empty;
    public string WorkingHoursSat { get; set; } = string.Empty;
    public string WorkingHoursSun { get; set; } = string.Empty;
    public string Coordinates { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
