using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProteiniSi.Api.Models
{
    [System.ComponentModel.DataAnnotations.Schema.Table("User")]
    public class UserDtoShort
    {
        [Key]
        public int User_Id { get; set; }
        public string User_FullName { get; set; } = string.Empty;
        public string Service_Type_Name { get; set; } = string.Empty;
        public string User_ProfileImagePath { get; set; }
    }
}