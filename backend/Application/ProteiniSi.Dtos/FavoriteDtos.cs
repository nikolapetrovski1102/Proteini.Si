using ProteiniSi.Models;

namespace ProteiniSi.Dtos;

public class FavoriteResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public FavoriteProduct? Data { get; set; }
}

public class FavoritesListResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public List<FavoriteProduct> Data { get; set; } = null!;
    public int TotalCount { get; set; }
}

public class IsFavoriteResponseDto
{
    public bool IsFavorite { get; set; }
}
