using Microsoft.AspNetCore.Http;

namespace ProteinisiBackend.Dtos.HomeSlider
{
    public class CreateHomeSliderDto
    {
        public IFormFile Image { get; set; }
        public IFormFile? MobileImage { get; set; }
        public string? ClickUrl { get; set; }
        public string? Title { get; set; }
    }
}