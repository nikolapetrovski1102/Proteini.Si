using System;

namespace ProteiniSi.Api.Models
{
    public class HomeSlider
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? ClickUrl { get; set; }
        public string? Title { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}