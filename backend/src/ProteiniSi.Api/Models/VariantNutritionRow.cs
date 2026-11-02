using System;

namespace ProteiniSi.Api.Models
{
    public class VariantNutritionRow
    {
        public int Row_Id { get; set; }
        public int Variant_Id { get; set; }
        public string Row_Name { get; set; }
        public int Display_Order { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
    }
}