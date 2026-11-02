using System.Data;
using System.Diagnostics;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ProteiniSi.Data;

public class SqlHelper : ISqlHelper
{
    private const int SlowCallMilliseconds = 500;

    private readonly string _connectionString;
    private readonly ILogger<SqlHelper> _logger;

    public SqlHelper(IConfiguration configuration, ILogger<SqlHelper> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");
        _logger = logger;
    }

    public Task<List<T>> QueryAsync<T>(string procedure, object? parameters = null) =>
        RunAsync(procedure, async connection =>
            (await connection.QueryAsync<T>(procedure, parameters, commandType: CommandType.StoredProcedure)).AsList());

    public Task<T?> QuerySingleOrDefaultAsync<T>(string procedure, object? parameters = null) =>
        RunAsync(procedure, connection =>
            connection.QueryFirstOrDefaultAsync<T>(procedure, parameters, commandType: CommandType.StoredProcedure));

    public Task<int> ExecuteAsync(string procedure, object? parameters = null) =>
        RunAsync(procedure, connection =>
            connection.ExecuteAsync(procedure, parameters, commandType: CommandType.StoredProcedure));

    public Task<T?> ExecuteScalarAsync<T>(string procedure, object? parameters = null) =>
        RunAsync(procedure, connection =>
            connection.ExecuteScalarAsync<T?>(procedure, parameters, commandType: CommandType.StoredProcedure));

    public Task<TResult> QueryMultipleAsync<TResult>(string procedure, object? parameters, Func<SqlMapper.GridReader, Task<TResult>> read) =>
        RunAsync(procedure, async connection =>
        {
            using var grid = await connection.QueryMultipleAsync(procedure, parameters, commandType: CommandType.StoredProcedure);
            return await read(grid);
        });

    public async Task<TResult> InTransactionAsync<TResult>(Func<IDbConnection, IDbTransaction, Task<TResult>> work)
    {
        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var result = await work(connection, transaction);
            await transaction.CommitAsync();
            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Transaction rolled back");
            throw;
        }
    }

    private async Task<TResult> RunAsync<TResult>(string procedure, Func<SqlConnection, Task<TResult>> call)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            await using var connection = new SqlConnection(_connectionString);
            var result = await call(connection);

            LogDuration(procedure, stopwatch.ElapsedMilliseconds);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Procedure {Procedure} failed after {ElapsedMs} ms", procedure, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }

    private void LogDuration(string procedure, long elapsedMs)
    {
        if (elapsedMs >= SlowCallMilliseconds)
            _logger.LogWarning("Slow procedure {Procedure} took {ElapsedMs} ms", procedure, elapsedMs);
        else
            _logger.LogDebug("Procedure {Procedure} took {ElapsedMs} ms", procedure, elapsedMs);
    }
}
