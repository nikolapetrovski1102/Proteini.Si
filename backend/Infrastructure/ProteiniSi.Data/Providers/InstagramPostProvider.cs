using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class InstagramPostProvider(ISqlHelper sql) : IInstagramPostProvider
{
    public Task<List<InstagramPost>> GetActiveAsync() =>
        sql.QueryAsync<InstagramPost>(StoredProcedures.InstagramPosts.GetActive);

    public Task<InstagramPost?> GetActiveByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<InstagramPost>(StoredProcedures.InstagramPosts.GetActiveById, new { Id = id });

    public async Task<int> CreateAsync(CreateInstagramPostDto post) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.InstagramPosts.Create, new
        {
            post.PostUrl,
            post.ImagePath,
            post.Description,
            post.LikeCount,
            post.PostedBy,
            post.PostedDate,
            post.CreatedBy
        });

    public async Task<bool> UpdateAsync(UpdateInstagramPostDto post) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.InstagramPosts.Update, new
        {
            post.Id,
            post.PostUrl,
            post.ImagePath,
            post.Description,
            post.LikeCount,
            post.PostedBy,
            post.PostedDate,
            post.UpdatedBy
        }) > 0;

    public async Task<bool> DeactivateAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.InstagramPosts.Deactivate, new { Id = id }) > 0;
}
