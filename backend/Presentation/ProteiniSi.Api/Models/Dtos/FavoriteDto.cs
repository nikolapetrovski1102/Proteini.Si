// Models/DTOs/FavoriteDto.cs
using System;

namespace ProteiniSi.Api.Models.DTOs
{
    public class FavoriteDto
    {
        public int FavoriteId { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ProductName { get; set; }
        public decimal ProductPrice { get; set; }
        public string ProductImage { get; set; }
    }

    public class AddFavoriteDto
    {
        public int ProductId { get; set; }
    }

    public class FavoriteResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public FavoriteDto Data { get; set; }
    }

    public class FavoritesListResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<FavoriteDto> Data { get; set; }
        public int TotalCount { get; set; }
    }

    public class IsFavoriteResponseDto
    {
        public bool IsFavorite { get; set; }
    }
}