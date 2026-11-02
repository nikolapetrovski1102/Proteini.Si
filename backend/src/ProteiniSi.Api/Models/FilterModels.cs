namespace ProteiniSi.Api.Models
{
    public class ProductCategory
    {
        public int Category_Id { get; set; }
        public string Category_Name { get; set; }
        public string Category_Slug { get; set; }
        public int? Parent_Category_Id { get; set; }  // ADD THIS
        public int Display_Order { get; set; }
    }

    public class Sport
    {
        public int Sport_Id { get; set; }
        public string Sport_Name { get; set; }
        public string Sport_Slug { get; set; }
        public int Display_Order { get; set; }
    }

    public class Goal
    {
        public int Goal_Id { get; set; }
        public string Goal_Name { get; set; }
        public string Goal_Slug { get; set; }
        public int Display_Order { get; set; }
    }

    public class UseTiming
    {
        public int UseTiming_Id { get; set; }
        public string UseTiming_Name { get; set; }
        public string UseTiming_Slug { get; set; }
        public int Display_Order { get; set; }
    }

    public class Flavor
    {
        public int Flavor_Id { get; set; }
        public string Flavor_Name { get; set; }
        public string Flavor_Slug { get; set; }
        public int Display_Order { get; set; }
    }

    public class Brand
    {
        public int Brand_Id { get; set; }
        public string Brand_Name { get; set; }
        public string Brand_Slug { get; set; }
        public string Logo_Url { get; set; }
        public int Display_Order { get; set; }
    }

    public class ProductTag
    {
        public int Tag_Id { get; set; }
        public string Tag_Name { get; set; }
        public string Tag_Slug { get; set; }
        public int Display_Order { get; set; }
    }
}