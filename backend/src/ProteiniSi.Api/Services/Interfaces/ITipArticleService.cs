using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.Dtos;

namespace ProteiniSi.Api.Services.Interfaces;

public interface ITipArticleService
{
    Task<List<TipArticle>> GetActiveAsync();
    Task<List<TipArticle>> GetAllAsync();
    Task<TipArticle> GetActiveBySlugAsync(string slug);
    Task<int> CreateAsync(TipArticleForm form);
    Task UpdateAsync(TipArticleForm form);
    Task DeleteAsync(int id);
}
