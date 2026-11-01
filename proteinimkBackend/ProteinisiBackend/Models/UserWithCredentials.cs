using ProteinisiBackend.Models;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProteinisiBackend.Models
{
    [Table("UserWithCredentials")]
    public class UserWithCredentials : User
    {
        public byte[]? PasswordHash { get; set; }
        public byte[]? PasswordSalt { get; set; }
    }
}