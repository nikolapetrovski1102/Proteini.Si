using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ProteinisiBackend.Classes
{
    public class Tools
    {
        [MethodImpl(MethodImplOptions.NoInlining)]
        public static string GetCurrentMethod()
        {
            return new StackTrace().GetFrame(1).GetMethod().Name;
        }
        public static bool IsValidEmail(string email)
        {
            // Regular expression for validating an email
            var emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            return Regex.IsMatch(email, emailPattern);
        }
        public static void ErrorLog(string msg)
        {
            try
            {
                string filepath = Path.Combine("C:/LOG_VALONSIGNAL", $@"ErrorLog_{DateTime.Now:yyyy-MM-dd}.txt");
                if (File.Exists(filepath))
                {
                    if (new FileInfo(filepath).Length > 100000000)
                    {
                        return;
                    }
                }
                using (StreamWriter streamwriter = new StreamWriter(filepath, true))
                {
                    streamwriter.WriteLine($"{DateTime.Now:HH:mm:ss.fff} - {msg} {Environment.NewLine}");
                    streamwriter.Flush();
                }
                System.Console.WriteLine($"{DateTime.Now:HH:mm:ss.fff} - {msg} {Environment.NewLine}");

            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"Error while ErrorLoging, {ex.Message}, {ex.InnerException}");
            }
        }
    }
}
