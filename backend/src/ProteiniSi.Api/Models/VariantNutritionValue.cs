using System;

namespace ProteiniSi.Api.Models
{
    public class VariantNutritionValue
    {
        public int Value_Id { get; set; }
        public int Row_Id { get; set; }
        public int Column_Id { get; set; }
        public string Cell_Value { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
    }
}