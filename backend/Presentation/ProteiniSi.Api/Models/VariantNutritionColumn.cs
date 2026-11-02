using System;

namespace ProteiniSi.Api.Models
{
    public class VariantNutritionColumn
    {
        public int Column_Id { get; set; }
        public int Variant_Id { get; set; }
        public string Column_Name { get; set; }
        public int Display_Order { get; set; }
        public bool Is_First_Column { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
    }
}