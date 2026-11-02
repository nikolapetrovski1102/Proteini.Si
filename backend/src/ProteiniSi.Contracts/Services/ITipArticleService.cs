using ProteiniSi.Models;
using ProteiniSi.Dtos;

namespace ProteiniSi.Contracts.Services;

public interface ITipArticleService
{
    Task<List<TipArticle>> GetActiveAsync();
    Task<List<TipArticle>> GetAllAsync();
    Task<TipArticle> GetActiveBySlugAsync(string slug);
    Task<int> CreateAsync(TipArticleForm form);
    Task UpdateAsync(TipArticleForm form);
    Task DeleteAsync(int id);
}
