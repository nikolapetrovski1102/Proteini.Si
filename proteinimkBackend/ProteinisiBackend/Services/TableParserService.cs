using System.Text.RegularExpressions;

namespace ProteinisiBackend.Services
{
    public class TableParserService
    {
        public (List<string> columns, List<TableRowData> rows) ParsePastedText(string rawText)
        {
            var lines = rawText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                               .Select(l => l.TrimEnd())
                               .Where(l => !string.IsNullOrWhiteSpace(l))
                               .ToList();

            if (lines.Count == 0)
                throw new ArgumentException("No data found in pasted text");

            // Parse all rows into cells
            var allRows = new List<List<string>>();
            foreach (var line in lines)
            {
                List<string> cells;

                if (line.Contains('\t'))
                {
                    cells = line.Split('\t').Select(c => c.Trim()).ToList();
                }
                else
                {
                    cells = Regex.Split(line, @"\s{2,}").Select(c => c.Trim()).ToList();
                }

                // Remove any empty first cell if it exists (caused by leading spaces/tabs)
                if (cells.Count > 0 && string.IsNullOrEmpty(cells[0]))
                {
                    cells.RemoveAt(0);
                }

                allRows.Add(cells);
            }

            if (allRows.Count == 0)
                throw new ArgumentException("No data found");

            // FIRST ROW = Column Headers
            var columns = allRows[0].ToList();

            // Remaining rows = data rows
            var rows = new List<TableRowData>();
            for (int i = 1; i < allRows.Count; i++)
            {
                var rowCells = allRows[i];
                if (rowCells.Count > 0)
                {
                    // First cell is the row label
                    var rowLabel = rowCells[0];
                    // Remaining cells are the values
                    var cells = rowCells.Skip(1).ToList();

                    // Pad with empty strings if needed
                    while (cells.Count < columns.Count - 1)
                    {
                        cells.Add("");
                    }

                    // Detect indentation
                    var indentLevel = DetectIndentLevel(lines[i]);

                    rows.Add(new TableRowData
                    {
                        RowLabel = rowLabel,
                        Cells = cells,
                        IndentLevel = indentLevel
                    });
                }
            }

            return (columns, rows);
        }

        private int DetectIndentLevel(string line)
        {
            var match = Regex.Match(line, @"^[\s\t]+");
            if (!match.Success) return 0;

            var indentChars = match.Value;
            if (indentChars.Contains('\t'))
                return indentChars.Count(c => c == '\t');
            else
                return indentChars.Length / 2;
        }
    }

    public class TableRowData
    {
        public string RowLabel { get; set; } = string.Empty;
        public List<string> Cells { get; set; } = new List<string>();
        public int IndentLevel { get; set; }
    }
}