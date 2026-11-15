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

/// <summary>One post from the Instagram feed sync, with its picture already saved locally.</summary>
public class InstagramFeedPostDto
{
    public string ShortCode { get; set; } = null!;
    public string PostUrl { get; set; } = null!;
    public string ImagePath { get; set; } = null!;
    public string? Description { get; set; }
    public int? LikeCount { get; set; }
    public string? PostedBy { get; set; }
    public DateTime? PostedDate { get; set; }
}

public class InstagramUpsertResult
{
    public int Id { get; set; }
    public bool Inserted { get; set; }
}

public class InstagramSyncResultDto
{
    public bool Configured { get; set; }
    public bool Success { get; set; }
    public int Fetched { get; set; }
    public int Added { get; set; }
    public int Updated { get; set; }
    public int ImagesDownloaded { get; set; }
    public string? Error { get; set; }
    public DateTime? FinishedAt { get; set; }
}
