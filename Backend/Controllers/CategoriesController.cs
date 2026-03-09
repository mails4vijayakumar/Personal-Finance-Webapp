using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceAPI.Data;
using PersonalFinanceAPI.Models;
using System.Security.Claims;

namespace PersonalFinanceAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim.Value);
        }

        // GET: api/categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            try
            {
                var userId = GetUserId();
                var categories = await _context.Categories
                    .Where(c => c.UserId == userId)
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // GET: api/categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            try
            {
                var userId = GetUserId();
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                    return NotFound(new { error = "Category not found" });

                // Verify user owns this category
                if (category.UserId != userId)
                    return Forbid();

                return Ok(category);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // POST: api/categories
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var userId = GetUserId();

                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest(new { error = "Category name is required" });

                // Check if category name already exists for this user
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.Name == dto.Name);
                
                if (existingCategory != null)
                    return BadRequest(new { error = "Category with this name already exists" });

                var category = new Category
                {
                    UserId = userId,
                    Name = dto.Name.Trim(),
                    ColorHex = dto.ColorHex ?? "#e0e0e0"
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // PUT: api/categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
        {
            try
            {
                var userId = GetUserId();
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                    return NotFound(new { error = "Category not found" });

                // Verify user owns this category
                if (category.UserId != userId)
                    return Forbid();

                // Validate input
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return BadRequest(new { error = "Category name is required" });

                // Check if new name already exists for this user (excluding current category)
                var existingCategory = await _context.Categories
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.Name == dto.Name && c.Id != id);
                
                if (existingCategory != null)
                    return BadRequest(new { error = "Category with this name already exists" });

                category.Name = dto.Name.Trim();
                if (!string.IsNullOrEmpty(dto.ColorHex))
                    category.ColorHex = dto.ColorHex;

                _context.Categories.Update(category);
                await _context.SaveChangesAsync();

                return Ok(category);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // DELETE: api/categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var userId = GetUserId();
                var category = await _context.Categories.FindAsync(id);

                if (category == null)
                    return NotFound(new { error = "Category not found" });

                // Verify user owns this category
                if (category.UserId != userId)
                    return Forbid();

                // Check if category is in use by any transactions
                var transactionsUsingCategory = await _context.Transactions
                    .Where(t => t.UserId == userId && t.CategoryId == id)
                    .AnyAsync();

                if (transactionsUsingCategory)
                    return BadRequest(new { error = "Cannot delete category that is in use by transactions" });

                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ColorHex { get; set; } // Optional color, defaults to #e0e0e0
    }

    public class UpdateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ColorHex { get; set; }
    }
}
