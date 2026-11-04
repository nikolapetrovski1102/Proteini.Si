using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Contracts.Services;
using ProteiniSi.Dtos;

namespace ProteiniSi.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SuperAdmin")]
public class InstagramPostsController(IInstagramPostService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAllPosts() => Ok(await service.GetActiveAsync());

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPostById(int id) => Ok(await service.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreateInstagramPostDto newPost)
    {
        var id = await service.CreateAsync(newPost);
        return Ok(new { Id = id, Message = "Post created successfully" });
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePost([FromBody] UpdateInstagramPostDto updatedPost)
    {
        await service.UpdateAsync(updatedPost);
        return Ok(new { Message = "Post updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        await service.DeleteAsync(id);
        return Ok(new { Message = "Post deleted successfully" });
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadInstagramImage(IFormFile file)
    {
        var path = await service.UploadImageAsync(file);
        return Ok(new { imagePath = path, message = "Image uploaded successfully" });
    }
}
