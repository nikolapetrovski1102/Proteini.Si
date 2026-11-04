using Microsoft.AspNetCore.Http;

namespace ProteiniSi.Dtos;

public class CreateAboutCompanySectionDto
{
    public string SectionType { get; set; } = null!;
    public string? Title { get; set; }
    public string? VideoUrl { get; set; }
    public IFormFile? VideoThumbnail { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateAboutCompanySectionDto
{
    public int Id { get; set; }
    public string SectionType { get; set; } = null!;
    public string? Title { get; set; }
    public string? VideoUrl { get; set; }
    public IFormFile? VideoThumbnail { get; set; }
    public string? Content { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public string? UpdatedBy { get; set; }
}

public class ReorderItemDto
{
    public int Id { get; set; }
    public int DisplayOrder { get; set; }
}
