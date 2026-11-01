using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProteinisiBackend.Database;
using ProteinisiBackend.Models;

namespace ProteinisiBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "SuperAdmin")]
    public class BranchLocationsController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public BranchLocationsController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
            EnsureTable();
        }

        private bool IsAdmin()
        {
            var isAdminClaim = User.FindFirst("superAdmin")?.Value;
            return isAdminClaim == "True" || isAdminClaim == "true";
        }

        private void EnsureTable()
        {
            string sql = @"
IF OBJECT_ID('dbo.BranchLocations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.BranchLocations (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Type NVARCHAR(20) NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        City NVARCHAR(200) NULL,
        Address NVARCHAR(500) NULL,
        Phone NVARCHAR(100) NULL,
        Email NVARCHAR(200) NULL,
        WorkingHoursMonFri NVARCHAR(100) NULL,
        WorkingHoursSat NVARCHAR(100) NULL,
        WorkingHoursSun NVARCHAR(100) NULL,
        Coordinates NVARCHAR(500) NULL,
        DisplayOrder INT NOT NULL DEFAULT 0,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
    );
END";

            _dapper.ExecuteSql(sql);
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GetActiveLocations([FromQuery] string? type = null)
        {
            string sql = @"
SELECT *
FROM BranchLocations
WHERE IsActive = 1
  AND (@Type IS NULL OR Type = @Type)
ORDER BY Type, DisplayOrder ASC, Id ASC";

            var locations = _dapper.LoadData<BranchLocation>(sql, new
            {
                Type = string.IsNullOrWhiteSpace(type) ? null : type
            });

            return Ok(new { status = true, data = locations });
        }

        [Authorize]
        [HttpGet("all")]
        public IActionResult GetAllLocations()
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            string sql = "SELECT * FROM BranchLocations ORDER BY Type, DisplayOrder ASC, Id ASC";
            var locations = _dapper.LoadData<BranchLocation>(sql);
            return Ok(new { status = true, data = locations });
        }

        [Authorize]
        [HttpPost]
        public IActionResult CreateLocation([FromBody] BranchLocation location)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            if (location.Type != "shop" && location.Type != "gym")
                return BadRequest(new { message = "Type must be shop or gym" });

            string sql = @"
INSERT INTO BranchLocations (
    Type, Name, City, Address, Phone, Email, WorkingHoursMonFri,
    WorkingHoursSat, WorkingHoursSun, Coordinates, DisplayOrder, IsActive, CreatedAt
) VALUES (
    @Type, @Name, @City, @Address, @Phone, @Email, @WorkingHoursMonFri,
    @WorkingHoursSat, @WorkingHoursSun, @Coordinates, @DisplayOrder, @IsActive, GETDATE()
);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            var id = _dapper.LoadDataSingle<int>(sql, location);
            return Ok(new { status = true, id, message = "Location created successfully" });
        }

        [Authorize]
        [HttpPut]
        public IActionResult UpdateLocation([FromBody] BranchLocation location)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            if (location.Type != "shop" && location.Type != "gym")
                return BadRequest(new { message = "Type must be shop or gym" });

            string sql = @"
UPDATE BranchLocations
SET Type = @Type,
    Name = @Name,
    City = @City,
    Address = @Address,
    Phone = @Phone,
    Email = @Email,
    WorkingHoursMonFri = @WorkingHoursMonFri,
    WorkingHoursSat = @WorkingHoursSat,
    WorkingHoursSun = @WorkingHoursSun,
    Coordinates = @Coordinates,
    DisplayOrder = @DisplayOrder,
    IsActive = @IsActive,
    UpdatedAt = GETDATE()
WHERE Id = @Id";

            var rows = _dapper.ExecuteSqlWithRowCount(sql, location);
            if (rows == 0)
                return NotFound(new { message = "Location not found" });

            return Ok(new { status = true, message = "Location updated successfully" });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult DeleteLocation(int id)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            string sql = "DELETE FROM BranchLocations WHERE Id = @Id";
            var rows = _dapper.ExecuteSqlWithRowCount(sql, new { Id = id });
            if (rows == 0)
                return NotFound(new { message = "Location not found" });

            return Ok(new { status = true, message = "Location deleted successfully" });
        }
    }
}
