using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models.DTOs;
using ProteinisiBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProteinisiBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class DynamicContentController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IConfiguration _config;

        public DynamicContentController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            return isAdminClaim == "True" || isAdminClaim == "true";
        }

        // GET: api/DynamicContent/{pageType}
        // Public endpoint - no authentication required
        [HttpGet("{pageType}")]
        [AllowAnonymous]
        public IActionResult GetSectionsByPage(string pageType)
        {
            try
            {
                // Validate page type
                if (pageType != "terms-of-service" && pageType != "general-provisions")
                {
                    return BadRequest(new { error = "Invalid page type. Allowed values: 'terms-of-service', 'general-provisions'" });
                }

                string sql = @"
                    SELECT 
                        Section_Id,
                        Page_Type,
                        Section_Type,
                        Title_Text,
                        Content_Text,
                        Display_Order,
                        IsActive,
                        IsBold,
                        IsItalic,
                        IsUnderline,
                        Text_Align,
                        Font_Size,
                        Text_Color,
                        Margin_Top,
                        Margin_Bottom,
                        Padding_Top,
                        Padding_Bottom,
                        Custom_CSS_Class,
                        Created_At,
                        Updated_At
                    FROM DynamicSections
                    WHERE Page_Type = @PageType AND IsActive = 1
                    ORDER BY Display_Order ASC";

                var sections = _dapper.LoadData<DynamicSectionResponseDto>(sql, new { PageType = pageType });

                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/DynamicContent/admin/{pageType}
        // Admin endpoint - gets all sections (including inactive)
        [HttpGet("admin/{pageType}")]
        [Authorize]
        public IActionResult GetAllSectionsForAdmin(string pageType)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Validate page type
                if (pageType != "terms-of-service" && pageType != "general-provisions")
                {
                    return BadRequest(new { error = "Invalid page type. Allowed values: 'terms-of-service', 'general-provisions'" });
                }

                string sql = @"
                    SELECT 
                        Section_Id,
                        Page_Type,
                        Section_Type,
                        Title_Text,
                        Content_Text,
                        Display_Order,
                        IsActive,
                        IsBold,
                        IsItalic,
                        IsUnderline,
                        Text_Align,
                        Font_Size,
                        Text_Color,
                        Margin_Top,
                        Margin_Bottom,
                        Padding_Top,
                        Padding_Bottom,
                        Custom_CSS_Class,
                        Created_At,
                        Updated_At
                    FROM DynamicSections
                    WHERE Page_Type = @PageType
                    ORDER BY Display_Order ASC";

                var sections = _dapper.LoadData<DynamicSectionResponseDto>(sql, new { PageType = pageType });

                return Ok(sections);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/DynamicContent/section/{id}
        // Get single section by ID (admin only)
        [HttpGet("section/{id}")]
        [Authorize]
        public IActionResult GetSectionById(int id)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string sql = @"
                    SELECT 
                        Section_Id,
                        Page_Type,
                        Section_Type,
                        Title_Text,
                        Content_Text,
                        Display_Order,
                        IsActive,
                        IsBold,
                        IsItalic,
                        IsUnderline,
                        Text_Align,
                        Font_Size,
                        Text_Color,
                        Margin_Top,
                        Margin_Bottom,
                        Padding_Top,
                        Padding_Bottom,
                        Custom_CSS_Class,
                        Created_At,
                        Updated_At
                    FROM DynamicSections
                    WHERE Section_Id = @Id";

                var section = _dapper.LoadDataSingleOrDefault<DynamicSectionResponseDto>(sql, new { Id = id });

                if (section == null)
                    return NotFound(new { error = "Section not found" });

                return Ok(section);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/DynamicContent/section
        // Create new section (admin only)
        [HttpPost("section")]
        [Authorize]
        public IActionResult CreateSection([FromBody] CreateDynamicSectionDto createDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Validate page type
                if (createDto.Page_Type != "terms-of-service" && createDto.Page_Type != "general-provisions")
                {
                    return BadRequest(new { error = "Invalid page type. Allowed values: 'terms-of-service', 'general-provisions'" });
                }

                // Validate section type
                var validSectionTypes = new[] { "title", "subtitle", "paragraph", "award", "spacer" };
                if (!validSectionTypes.Contains(createDto.Section_Type))
                {
                    return BadRequest(new { error = "Invalid section type. Allowed values: 'title', 'subtitle', 'paragraph', 'award', 'spacer'" });
                }

                string sql = @"
                    INSERT INTO DynamicSections (
                        Page_Type, Section_Type, Title_Text, Content_Text, Display_Order, IsActive,
                        IsBold, IsItalic, IsUnderline, Text_Align, Font_Size, Text_Color,
                        Margin_Top, Margin_Bottom, Padding_Top, Padding_Bottom, Custom_CSS_Class,
                        Created_At, Created_By
                    ) VALUES (
                        @Page_Type, @Section_Type, @Title_Text, @Content_Text, @Display_Order, @IsActive,
                        @IsBold, @IsItalic, @IsUnderline, @Text_Align, @Font_Size, @Text_Color,
                        @Margin_Top, @Margin_Bottom, @Padding_Top, @Padding_Bottom, @Custom_CSS_Class,
                        GETDATE(), @Created_By
                    );
                    SELECT CAST(SCOPE_IDENTITY() AS int);";

                var createdBy = User.FindFirst("email")?.Value ?? "admin";

                var sectionId = _dapper.LoadDataSingle<int>(sql, new
                {
                    createDto.Page_Type,
                    createDto.Section_Type,
                    Title_Text = createDto.Title_Text ?? "",
                    Content_Text = createDto.Content_Text ?? "",
                    createDto.Display_Order,
                    createDto.IsActive,
                    createDto.IsBold,
                    createDto.IsItalic,
                    createDto.IsUnderline,
                    Text_Align = createDto.Text_Align ?? "left",
                    createDto.Font_Size,
                    createDto.Text_Color,
                    createDto.Margin_Top,
                    createDto.Margin_Bottom,
                    createDto.Padding_Top,
                    createDto.Padding_Bottom,
                    createDto.Custom_CSS_Class,
                    Created_By = createdBy
                });

                return Ok(new
                {
                    status = true,
                    message = "Section created successfully",
                    sectionId = sectionId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/DynamicContent/section
        // Update section (admin only)
        [HttpPut("section")]
        [Authorize]
        public IActionResult UpdateSection([FromBody] UpdateDynamicSectionDto updateDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Validate section type
                var validSectionTypes = new[] { "title", "subtitle", "paragraph", "award", "spacer" };
                if (!validSectionTypes.Contains(updateDto.Section_Type))
                {
                    return BadRequest(new { error = "Invalid section type. Allowed values: 'title', 'subtitle', 'paragraph', 'award', 'spacer'" });
                }

                string sql = @"
                    UPDATE DynamicSections 
                    SET Section_Type = @Section_Type,
                        Title_Text = @Title_Text,
                        Content_Text = @Content_Text,
                        Display_Order = @Display_Order,
                        IsActive = @IsActive,
                        IsBold = @IsBold,
                        IsItalic = @IsItalic,
                        IsUnderline = @IsUnderline,
                        Text_Align = @Text_Align,
                        Font_Size = @Font_Size,
                        Text_Color = @Text_Color,
                        Margin_Top = @Margin_Top,
                        Margin_Bottom = @Margin_Bottom,
                        Padding_Top = @Padding_Top,
                        Padding_Bottom = @Padding_Bottom,
                        Custom_CSS_Class = @Custom_CSS_Class,
                        Updated_At = GETDATE(),
                        Updated_By = @Updated_By
                    WHERE Section_Id = @Section_Id";

                var updatedBy = User.FindFirst("email")?.Value ?? "admin";

                var rowsAffected = _dapper.ExecuteSqlWithRowCount(sql, new
                {
                    updateDto.Section_Id,
                    updateDto.Section_Type,
                    Title_Text = updateDto.Title_Text ?? "",
                    Content_Text = updateDto.Content_Text ?? "",
                    updateDto.Display_Order,
                    updateDto.IsActive,
                    updateDto.IsBold,
                    updateDto.IsItalic,
                    updateDto.IsUnderline,
                    Text_Align = updateDto.Text_Align ?? "left",
                    updateDto.Font_Size,
                    updateDto.Text_Color,
                    updateDto.Margin_Top,
                    updateDto.Margin_Bottom,
                    updateDto.Padding_Top,
                    updateDto.Padding_Bottom,
                    updateDto.Custom_CSS_Class,
                    Updated_By = updatedBy
                });

                if (rowsAffected == 0)
                    return NotFound(new { error = "Section not found" });

                return Ok(new { status = true, message = "Section updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/DynamicContent/section/{id}
        // Delete section (admin only)
        [HttpDelete("section/{id}")]
        [Authorize]
        public IActionResult DeleteSection(int id)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string sql = "DELETE FROM DynamicSections WHERE Section_Id = @Id";
                var rowsAffected = _dapper.ExecuteSqlWithRowCount(sql, new { Id = id });

                if (rowsAffected == 0)
                    return NotFound(new { error = "Section not found" });

                return Ok(new { status = true, message = "Section deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/DynamicContent/reorder
        // Reorder sections (admin only)
        [HttpPost("reorder")]
        [Authorize]
        public IActionResult ReorderSections([FromBody] ReorderDynamicSectionsDto reorderDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                foreach (var section in reorderDto.Sections)
                {
                    string sql = @"
                        UPDATE DynamicSections 
                        SET Display_Order = @Display_Order,
                            Updated_At = GETDATE()
                        WHERE Section_Id = @Section_Id";

                    _dapper.ExecuteSql(sql, new
                    {
                        section.Section_Id,
                        section.Display_Order
                    });
                }

                return Ok(new { status = true, message = "Sections reordered successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
