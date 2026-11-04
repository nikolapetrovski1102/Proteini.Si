using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class YouTubeVideosController(IYouTubeVideoService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllVideos() => Ok(await service.GetActiveAsync());

    [HttpGet("all")]
    public async Task<IActionResult> GetAllVideosIncludingInactive() => Ok(await service.GetAllAsync());

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetVideoById(int id) => Ok(await service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> CreateVideo([FromForm] CreateYouTubeVideoDto newVideo)
    {
        var (id, thumbnailPath) = await service.CreateAsync(newVideo);
        return Ok(new { Id = id, Message = "Video created successfully", ThumbnailPath = thumbnailPath });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateVideo([FromForm] UpdateYouTubeVideoDto updatedVideo)
    {
        var thumbnailPath = await service.UpdateAsync(updatedVideo);
        return Ok(new { Message = "Video updated successfully", ThumbnailPath = thumbnailPath });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { Message = "Video deleted successfully" });
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> ReorderVideos([FromBody] List<ReorderItemDto> reorderList)
    {
        await service.ReorderAsync(reorderList);
        return Ok(new { Message = "Videos reordered successfully" });
    }

    [HttpPost("upload-thumbnail")]
    public async Task<IActionResult> UploadThumbnail(IFormFile file)
    {
        var path = await service.UploadThumbnailAsync(file);
        return Ok(new { thumbnailPath = path, message = "Thumbnail uploaded successfully" });
    }
}
