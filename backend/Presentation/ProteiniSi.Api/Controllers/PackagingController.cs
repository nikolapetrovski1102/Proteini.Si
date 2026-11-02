using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteiniSi.Api.Database;
using ProteiniSi.Api.Models;
using ProteiniSi.Api.Models.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ProteiniSi.Api.Controllers
{
    [Authorize(Policy = "SuperAdmin")]
    [Route("api/admin/[controller]")]
    [ApiController]
    public class PackagingController : ControllerBase
    {
        private readonly DataContextDapper _dapper;
        private readonly IConfiguration _config;

        public PackagingController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
            _config = config;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return 0;
            return int.Parse(userIdClaim);
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            return isAdminClaim == "True" || isAdminClaim == "true";
        }

        // GET: api/admin/Packaging
        [HttpGet]
        public IActionResult GetAllPackaging()
        {
            try
            {
                string sql = "SELECT * FROM Packaging WHERE IsActive = 1 ORDER BY Display_Order ASC";
                var packaging = _dapper.LoadData<Packaging>(sql);
                return Ok(new { status = true, data = packaging });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/admin/Packaging/{id}
        [HttpGet("{id}")]
        public IActionResult GetPackagingById(int id)
        {
            try
            {
                string sql = "SELECT * FROM Packaging WHERE Packaging_Id = @Id AND IsActive = 1";
                var packaging = _dapper.LoadDataSingleOrDefault<Packaging>(sql, new { Id = id });

                if (packaging == null)
                    return NotFound(new { message = "Packaging not found" });

                return Ok(new { status = true, data = packaging });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // POST: api/admin/Packaging
        [HttpPost]
        public IActionResult CreatePackaging([FromBody] CreatePackagingDto createDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                if (string.IsNullOrEmpty(createDto.Packaging_Name))
                    return BadRequest(new { message = "Packaging name is required" });

                string sql = @"
                    INSERT INTO Packaging (Packaging_Name, Packaging_Type, Weight_Grams, Quantity_Per_Box, Display_Order, IsActive, Created_At)
                    VALUES (@Packaging_Name, @Packaging_Type, @Weight_Grams, @Quantity_Per_Box, @Display_Order, 1, GETDATE());
                    SELECT CAST(SCOPE_IDENTITY() AS int);";

                var id = _dapper.LoadDataSingle<int>(sql, new
                {
                    Packaging_Name = createDto.Packaging_Name,
                    Packaging_Type = createDto.Packaging_Type,
                    Weight_Grams = createDto.Weight_Grams,
                    Quantity_Per_Box = createDto.Quantity_Per_Box,
                    Display_Order = createDto.Display_Order
                });

                return Ok(new { status = true, message = "Packaging created successfully", packagingId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // PUT: api/admin/Packaging
        [HttpPut]
        public IActionResult UpdatePackaging([FromBody] UpdatePackagingDto updateDto)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                string sql = @"
                    UPDATE Packaging 
                    SET Packaging_Name = @Packaging_Name,
                        Packaging_Type = @Packaging_Type,
                        Weight_Grams = @Weight_Grams,
                        Quantity_Per_Box = @Quantity_Per_Box,
                        Display_Order = @Display_Order,
                        IsActive = @IsActive
                    WHERE Packaging_Id = @Packaging_Id";

                var rowsAffected = _dapper.ExecuteSqlWithRowCount(sql, new
                {
                    Packaging_Id = updateDto.Packaging_Id,
                    Packaging_Name = updateDto.Packaging_Name,
                    Packaging_Type = updateDto.Packaging_Type,
                    Weight_Grams = updateDto.Weight_Grams,
                    Quantity_Per_Box = updateDto.Quantity_Per_Box,
                    Display_Order = updateDto.Display_Order,
                    IsActive = updateDto.IsActive
                });

                if (rowsAffected == 0)
                    return NotFound(new { message = "Packaging not found" });

                return Ok(new { status = true, message = "Packaging updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // DELETE: api/admin/Packaging/{id}
        [HttpDelete("{id}")]
        public IActionResult DeletePackaging(int id)
        {
            try
            {
                if (!IsAdmin())
                    return Unauthorized(new { message = "Admin access required" });

                // Soft delete
                string sql = "UPDATE Packaging SET IsActive = 0 WHERE Packaging_Id = @Id";
                var rowsAffected = _dapper.ExecuteSqlWithRowCount(sql, new { Id = id });

                if (rowsAffected == 0)
                    return NotFound(new { message = "Packaging not found" });

                return Ok(new { status = true, message = "Packaging deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
