namespace ProteiniSi.Services.Helpers;

public static class EmailMask
{
    public static string? Mask(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return email;

        var atIndex = email.IndexOf('@');
        if (atIndex <= 1)
            return "***";

        var local = email[..atIndex];
        var domain = email[atIndex..];
        var visibleLocal = local.Length <= 2 ? local[..1] : local[..2];
        return $"{visibleLocal}***{domain}";
    }
}
