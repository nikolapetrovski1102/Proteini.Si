using System.Collections.Generic;

namespace ProteiniSi.Api.Models.DTOs
{
    public class ReorderDynamicSectionsDto
    {
        public List<SectionOrderDto> Sections { get; set; }
    }

    public class SectionOrderDto
    {
        public int Section_Id { get; set; }
        public int Display_Order { get; set; }
    }
}