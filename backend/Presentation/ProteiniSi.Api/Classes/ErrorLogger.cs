using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace ProteiniSi.Api.Classes
{
    public class ErrorLogger
    {
        public static void ErrorLog(string msg, Exception ex = null, string confidentText = "", string updateIdentifier = "", bool writeCompanyInfo = false, string ErrorFileName = "ErrorLog")
        {
            //string methodname = "";

            //if (ex != null)
            //{
            //    var st = new StackTrace(ex);
            //    var thisasm = Assembly.GetExecutingAssembly();
            //    methodname = st.GetFrames().Select(f => f.GetMethod()).First(m => m.Module.Assembly == thisasm).Name;
            //}

            //var logEntry = new LogEntry
            //{
            //    Message = msg,
            //    MethodName = methodname,
            //    Exception = ex,
            //    ErrorFileName = ErrorFileName,
            //    UpdateIdentifier = updateIdentifier,
            //    writeCompanyInfo = writeCompanyInfo,
            //    WriteDateTime = DateTime.Now
            //};


            //_logQueue.Add(logEntry);
        }
    }
}
