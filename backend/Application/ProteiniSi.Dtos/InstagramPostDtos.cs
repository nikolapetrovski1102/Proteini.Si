namespace ProteiniSi.Dtos;

public class CreateInstagramPostDto
{
    public string PostUrl { get; set; } = null!;
    public string ImagePath { get; set; } = null!;
    public string? Description { get; set; }
    public int LikeCount { get; set; }
    public string? PostedBy { get; set; }
    public DateTime? PostedDate { get; set; }
    public string? CreatedBy { get; set; }
}

public class UpdateInstagramPostDto
{
    public int Id { get; set; }
    public string PostUrl { get; set; } = null!;
    public string ImagePath { get; set; } = null!;
    public string? Description { get; set; }
    public int LikeCount { get; set; }
    public string? PostedBy { get; set; }
    public DateTime? PostedDate { get; set; }
    public string? UpdatedBy { get; set; }
}
