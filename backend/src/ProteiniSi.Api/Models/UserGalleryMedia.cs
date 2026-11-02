namespace ProteiniSi.Api.Models
{
    public class UserGalleryMedia
    {
        public int Media_Id { get; set; }
        public int User_Id { get; set; }
        public string Media_Path { get; set; }
        public string Media_Type { get; set; } // "image" or "video"
        public DateTime Uploaded_At { get; set; }
    }
}
