using ProteiniSi.Models;

namespace ProteiniSi.Contracts.Providers;

public interface ITipArticleProvider
{
    Task<List<TipArticle>> GetActiveAsync();
    Task<List<TipArticle>> GetAllAsync();
    Task<TipArticle?> GetByIdAsync(int id);
    Task<TipArticle?> GetActiveBySlugAsync(string slug);
    Task<bool> SlugExistsAsync(string slug, int? excludingId);
    Task<int> CreateAsync(TipArticle article);
    Task UpdateAsync(TipArticle article);
    Task<bool> DeleteAsync(int id);
}
