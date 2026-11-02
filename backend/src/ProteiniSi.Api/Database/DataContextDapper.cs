using ProteiniSi.Api.Classes;
using Dapper;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;

namespace ProteiniSi.Api.Database
{
    public class DataContextDapper
    {
        IConfiguration _config;
        public DataContextDapper(IConfiguration config)
        {
            _config = config;
        }

        public IEnumerable<T> LoadData<T>(string sql)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Query<T>(sql);
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to load data", ex);
            }
        }

        // Add parameterized version
        public IEnumerable<T> LoadData<T>(string sql, object parameters)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Query<T>(sql, parameters);
            }
            catch (Exception ex)
            {
                // Log to your existing ErrorLogger instead of writing to file
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog(
                    $"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}",
                    confidentText: $"Query={sql}, Params:{JsonConvert.SerializeObject(parameters)}"
                );
                throw new Exception("Failed to load data", ex);
            }
        }

        public T LoadDataSingle<T>(string sql)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.QuerySingle<T>(sql);
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to load data", ex);
            }
        }

        // Add parameterized version
        public T LoadDataSingle<T>(string sql, object parameters)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                var result = dbConnection.QuerySingleOrDefault<T>(sql, parameters);

                if (result == null)
                {
                    return default(T);
                }

                return result;
            }
            catch (Exception ex)
            {
                // Log to your existing ErrorLogger instead of writing to file
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog(
                    $"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}",
                    confidentText: $"Query={sql}, Params:{JsonConvert.SerializeObject(parameters)}"
                );
                throw new Exception("Failed to load data", ex);
            }
        }

        public bool ExecuteSql(string sql)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Execute(sql) > 0;
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to execute data", ex);
            }
        }

        // Add parameterized version
        public bool ExecuteSql(string sql, object parameters)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Execute(sql, parameters) > 0;
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to execute data", ex);
            }
        }

        public int ExecuteSqlWithRowCount(string sql)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Execute(sql);
            }

            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to execute data", ex);
            }
        }

        // Add parameterized version
        public int ExecuteSqlWithRowCount(string sql, object parameters)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Execute(sql, parameters);
            }

            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}, Params:{JsonConvert.SerializeObject(parameters)}");
                throw new Exception("Failed to execute data", ex);
            }
        }

        public T LoadDataSingleOrDefault<T>(string sql)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Query<T>(sql).FirstOrDefault();
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}");
                throw new Exception("Failed to load data", ex);
            }
        }

        // Add parameterized version
        public T LoadDataSingleOrDefault<T>(string sql, object parameters)
        {
            try
            {
                IDbConnection dbConnection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
                return dbConnection.Query<T>(sql, parameters).FirstOrDefault();
            }
            catch (Exception ex)
            {
                ProteiniSi.Api.Classes.ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}{Environment.NewLine}{ex.InnerException}{Environment.NewLine}", confidentText: $"Query={sql}, Params:{JsonConvert.SerializeObject(parameters)}");
                throw new Exception("Failed to load data", ex);
            }
        }

        public IDbConnection GetConnection()
        {
            return new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        }

        public void ExecuteInTransaction(Action<IDbConnection, IDbTransaction> action)
        {
            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        action(connection, transaction);
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public T ExecuteInTransaction<T>(Func<IDbConnection, IDbTransaction, T> func)
        {
            using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var result = func(connection, transaction);
                        transaction.Commit();
                        return result;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        public bool ExecuteRawSql(string sql)
        {
            try
            {
                using (var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection")))
                {
                    connection.Open();
                    using (var command = new SqlCommand(sql, connection))
                    {
                        int rowsAffected = command.ExecuteNonQuery();
                        return rowsAffected > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorLogger.ErrorLog($"{Tools.GetCurrentMethod()}: {ex.Message}{Environment.NewLine}{ex.StackTrace}",
                    confidentText: $"Query={sql}");
                throw;
            }
        }
    }
}