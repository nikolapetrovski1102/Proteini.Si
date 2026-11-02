using Dapper;
using ProteiniSi.Data;
using ProteiniSi.Models;
using ProteiniSi.Contracts.Providers;

namespace ProteiniSi.Data.Providers;

public class TipArticleProvider(ISqlHelper sql) : ITipArticleProvider
{
    public Task<List<TipArticle>> GetActiveAsync() =>
        sql.QueryAsync<TipArticle>(StoredProcedures.TipArticles.GetActive);

    public Task<List<TipArticle>> GetAllAsync() =>
        sql.QueryAsync<TipArticle>(StoredProcedures.TipArticles.GetAll);

    public Task<TipArticle?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<TipArticle>(StoredProcedures.TipArticles.GetById, new { Id = id });

    public Task<TipArticle?> GetActiveBySlugAsync(string slug) =>
        sql.QuerySingleOrDefaultAsync<TipArticle>(StoredProcedures.TipArticles.GetActiveBySlug, new { Slug = slug });

    public async Task<bool> SlugExistsAsync(string slug, int? excludingId) =>
        await sql.ExecuteScalarAsync<bool>(StoredProcedures.TipArticles.SlugExists, new { Slug = slug, ExcludingId = excludingId });

    public async Task<int> CreateAsync(TipArticle article) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.TipArticles.Create, ToParameters(article));

    public Task UpdateAsync(TipArticle article) =>
        sql.ExecuteAsync(StoredProcedures.TipArticles.Update, ToParameters(article, includeId: true));

    public async Task<bool> DeleteAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.TipArticles.Delete, new { Id = id }) > 0;

    private static DynamicParameters ToParameters(TipArticle article, bool includeId = false)
    {
        var parameters = new DynamicParameters(new
        {
            article.Category,
            article.Title,
            article.TitleAl,
            article.Subtitle,
            article.SubtitleAl,
            article.Content,
            article.ContentAl,
            article.Slug,
            article.SeoTitle,
            article.SeoDescription,
            article.ImagePath,
            article.DisplayOrder,
            article.IsActive
        });

        if (includeId)
            parameters.Add("Id", article.Id);

        return parameters;
    }
}
