using System.Collections.Generic;

namespace ProteiniSi.Api.Models.DTOs
{
    public class VariantNutritionDto
    {
        public List<NutritionColumnDto> Columns { get; set; }
        public List<NutritionRowDto> Rows { get; set; }
    }

    public class NutritionColumnDto
    {
        public int? Column_Id { get; set; }
        public string Column_Name { get; set; }
        public int Display_Order { get; set; }
        public bool Is_First_Column { get; set; }
    }

    public class NutritionRowDto
    {
        public int? Row_Id { get; set; }
        public string Row_Name { get; set; }
        public int Display_Order { get; set; }
        public Dictionary<string, string> Values { get; set; } // Column_Name -> Cell_Value
    }
}