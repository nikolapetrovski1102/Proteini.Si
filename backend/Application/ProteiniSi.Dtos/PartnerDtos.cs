using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class CreatePartnerDto
{
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public IFormFile Image { get; set; } = null!;
    public string? Url { get; set; }
    public int DisplayOrder { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdatePartnerDto
{
    public int Id { get; set; }
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public IFormFile? Image { get; set; }
    public string? Url { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public string? UpdatedBy { get; set; }
}
