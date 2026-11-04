using ProteiniSi.Contracts.Providers;
using ProteiniSi.Dtos;
using ProteiniSi.Models;

namespace ProteiniSi.Data.Providers;

public class YouTubeVideoProvider(ISqlHelper sql) : IYouTubeVideoProvider
{
    public Task<List<YouTubeVideo>> GetActiveAsync() =>
        sql.QueryAsync<YouTubeVideo>(StoredProcedures.YouTubeVideos.GetActive);

    public Task<List<YouTubeVideo>> GetAllAsync() =>
        sql.QueryAsync<YouTubeVideo>(StoredProcedures.YouTubeVideos.GetAll);

    public Task<YouTubeVideo?> GetByIdAsync(int id) =>
        sql.QuerySingleOrDefaultAsync<YouTubeVideo>(StoredProcedures.YouTubeVideos.GetById, new { Id = id });

    public async Task<int> CreateAsync(CreateYouTubeVideoDto video, string thumbnailPath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.YouTubeVideos.Create, new
        {
            video.VideoUrl,
            ThumbnailPath = thumbnailPath,
            video.Title,
            video.Description,
            video.ViewCount,
            video.LikeCount,
            video.DisplayOrder,
            video.CreatedBy
        });

    public async Task<bool> UpdateAsync(UpdateYouTubeVideoDto video, string thumbnailPath) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.YouTubeVideos.Update, new
        {
            video.Id,
            video.VideoUrl,
            ThumbnailPath = thumbnailPath,
            video.Title,
            video.Description,
            video.ViewCount,
            video.LikeCount,
            video.DisplayOrder,
            video.UpdatedBy
        }) > 0;

    public async Task<bool> DeactivateAsync(int id) =>
        await sql.ExecuteScalarAsync<int>(StoredProcedures.YouTubeVideos.Deactivate, new { Id = id }) > 0;

    public Task ReorderAsync(IEnumerable<ReorderItemDto> items) =>
        sql.ExecuteAsync(StoredProcedures.YouTubeVideos.Reorder, new
        {
            Items = TableParameters.IdOrderList(items.Select(item => (item.Id, item.DisplayOrder)))
        });
}
