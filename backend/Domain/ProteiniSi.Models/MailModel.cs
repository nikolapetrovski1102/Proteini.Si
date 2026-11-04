namespace ProteiniSi.Models;

public class MailModel
{
    public int SMTPPort { get; set; }
    public string host { get; set; } = string.Empty;
    public string sender_username { get; set; } = string.Empty;
    public string sender_email { get; set; } = string.Empty;
    public string sender_name { get; set; } = string.Empty;
    public string sender_password { get; set; } = string.Empty;
    public List<string> ToRecipients { get; set; } = [];
    public List<string> CcRecipients { get; set; } = [];
    public string content { get; set; } = string.Empty;
    public bool EnableSsl { get; set; }
    public bool CheckCertificateRevocation { get; set; } = true;
    public string subject { get; set; } = string.Empty;
}
