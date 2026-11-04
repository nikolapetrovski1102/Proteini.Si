using System.Data;
using Dapper;

namespace ProteiniSi.Data;

public static class TableParameters
{
    public static SqlMapper.ICustomQueryParameter IntList(IEnumerable<int> ids)
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(int));

        foreach (var id in ids.Distinct())
            table.Rows.Add(id);

        return table.AsTableValuedParameter("dbo.IntList");
    }

    public static SqlMapper.ICustomQueryParameter IdOrderList(IEnumerable<(int Id, int DisplayOrder)> items)
    {
        var table = new DataTable();
        table.Columns.Add("Id", typeof(int));
        table.Columns.Add("DisplayOrder", typeof(int));

        foreach (var item in items.GroupBy(item => item.Id).Select(group => group.Last()))
            table.Rows.Add(item.Id, item.DisplayOrder);

        return table.AsTableValuedParameter("dbo.IdOrderList");
    }

    public static SqlMapper.ICustomQueryParameter StringList(IEnumerable<string> values)
    {
        var table = new DataTable();
        table.Columns.Add("Value", typeof(string));

        foreach (var value in values)
            table.Rows.Add(value);

        return table.AsTableValuedParameter("dbo.StringList");
    }
}
