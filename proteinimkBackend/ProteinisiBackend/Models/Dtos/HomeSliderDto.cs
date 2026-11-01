namespace ProteinisiBackend.Dtos.HomeSlider
{
    public class HomeSliderDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? MobileImageUrl { get; set; }
        public string? ClickUrl { get; set; }
        public string? Title { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}