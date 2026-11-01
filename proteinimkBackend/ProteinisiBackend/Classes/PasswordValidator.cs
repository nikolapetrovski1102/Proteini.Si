using System.Text.RegularExpressions;

namespace ProteinisiBackend.Helpers
{
    public class PasswordValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new List<string>();

        // Track which requirements are met (for real-time feedback)
        public PasswordRequirements MetRequirements { get; set; } = new PasswordRequirements();
        public PasswordRequirements MissingRequirements { get; set; } = new PasswordRequirements();
    }

    public class PasswordRequirements
    {
        public bool MinLength { get; set; }
        public bool Uppercase { get; set; }
        public bool Lowercase { get; set; }
        public bool Digit { get; set; }
        public bool SpecialChar { get; set; }

        public int MetCount => (MinLength ? 1 : 0) + (Uppercase ? 1 : 0) +
                                (Lowercase ? 1 : 0) + (Digit ? 1 : 0) + (SpecialChar ? 1 : 0);
        public int TotalRequired => 5;
        public int StrengthPercent => (MetCount * 100) / TotalRequired;
    }

    public static class PasswordValidator
    {
        public static PasswordValidationResult Validate(string password)
        {
            var result = new PasswordValidationResult { IsValid = true };

            if (string.IsNullOrWhiteSpace(password))
            {
                result.IsValid = false;
                result.Errors.Add("Password is required");
                return result;
            }

            // Check each requirement
            bool hasMinLength = password.Length >= 8;
            bool hasUppercase = Regex.IsMatch(password, @"[A-Z]");
            bool hasLowercase = Regex.IsMatch(password, @"[a-z]");
            bool hasDigit = Regex.IsMatch(password, @"[0-9]");
            bool hasSpecialChar = Regex.IsMatch(password, @"[!@#$%^&*(),.?"":{}|<>]");

            // Set met requirements
            result.MetRequirements.MinLength = hasMinLength;
            result.MetRequirements.Uppercase = hasUppercase;
            result.MetRequirements.Lowercase = hasLowercase;
            result.MetRequirements.Digit = hasDigit;
            result.MetRequirements.SpecialChar = hasSpecialChar;

            // Build error list - ONLY show what's missing
            if (!hasMinLength)
                result.Errors.Add("Password must be at least 8 characters long");

            if (!hasUppercase)
                result.Errors.Add("Password must contain at least one uppercase letter (A-Z)");

            if (!hasLowercase)
                result.Errors.Add("Password must contain at least one lowercase letter (a-z)");

            if (!hasDigit)
                result.Errors.Add("Password must contain at least one number (0-9)");

            if (!hasSpecialChar)
                result.Errors.Add("Password must contain at least one special character (!@#$%^&* etc.)");

            // Set missing requirements
            result.MissingRequirements.MinLength = !hasMinLength;
            result.MissingRequirements.Uppercase = !hasUppercase;
            result.MissingRequirements.Lowercase = !hasLowercase;
            result.MissingRequirements.Digit = !hasDigit;
            result.MissingRequirements.SpecialChar = !hasSpecialChar;

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        // Optional: Get password strength description
        public static string GetStrengthDescription(int strengthPercent)
        {
            if (strengthPercent <= 20) return "Very Weak";
            if (strengthPercent <= 40) return "Weak";
            if (strengthPercent <= 60) return "Fair";
            if (strengthPercent <= 80) return "Strong";
            return "Very Strong";
        }
    }
}