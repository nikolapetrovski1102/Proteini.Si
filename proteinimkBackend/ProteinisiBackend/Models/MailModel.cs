namespace ProteinisiBackend.Models
{
    public class MailModel
    {
        public int SMTPPort { get; set; }
        public string host { get; set; }
        public string sender_username { get; set; }
        public string sender_email { get; set; }
        public string sender_name { get; set; }
        public string sender_password { get; set; }
        public List<string> ToRecipients { get; set; }
        public List<string> CcRecipients { get; set; } = new();
        public string content { get; set; }
        public bool EnableSsl { get; set; }
        public bool CheckCertificateRevocation { get; set; } = true;
        public string subject { get; set; }
    }
}
