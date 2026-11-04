using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class CreateLandingPageSectionDto
{
    public string SectionType { get; set; } = null!;
    public string? Title { get; set; }
    public IFormFile? Image { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateLandingPageSectionDto
{
    public int Id { get; set; }
    public string SectionType { get; set; } = null!;
    public string? Title { get; set; }
    public IFormFile? Image { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public string? UpdatedBy { get; set; }
}
