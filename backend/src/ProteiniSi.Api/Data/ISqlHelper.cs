using System.Data;
using Dapper;

namespace ProteiniSi.Api.Data;

public interface ISqlHelper
{
    Task<List<T>> QueryAsync<T>(string procedure, object? parameters = null);
    Task<T?> QuerySingleOrDefaultAsync<T>(string procedure, object? parameters = null);
    Task<int> ExecuteAsync(string procedure, object? parameters = null);
    Task<T?> ExecuteScalarAsync<T>(string procedure, object? parameters = null);
    Task<TResult> QueryMultipleAsync<TResult>(string procedure, object? parameters, Func<SqlMapper.GridReader, Task<TResult>> read);
    Task<TResult> InTransactionAsync<TResult>(Func<IDbConnection, IDbTransaction, Task<TResult>> work);
}
