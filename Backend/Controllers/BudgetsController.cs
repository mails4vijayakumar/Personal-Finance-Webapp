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
    public class BudgetsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BudgetsController(ApplicationDbContext context)
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

        // GET: api/budgets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets([FromQuery] int? month = null, [FromQuery] int? year = null)
        {
            try
            {
                var userId = GetUserId();
                
                // Default to current month/year if not specified
                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var budgets = await _context.Budgets
                    .Where(b => b.UserId == userId && b.Month == targetMonth && b.Year == targetYear)
                    .Include(b => b.Category)
                    .OrderBy(b => b.Category!.Name)
                    .ToListAsync();

                return Ok(budgets);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // GET: api/budgets/status - Get spending vs budget comparison
        [HttpGet("status")]
        public async Task<ActionResult<BudgetStatusDto>> GetBudgetStatus([FromQuery] int? month = null, [FromQuery] int? year = null)
        {
            try
            {
                var userId = GetUserId();

                // Default to current month/year if not specified
                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var budgets = await _context.Budgets
                    .Where(b => b.UserId == userId && b.Month == targetMonth && b.Year == targetYear)
                    .Include(b => b.Category)
                    .ToListAsync();

                var budgetStatus = new List<BudgetStatusItemDto>();

                foreach (var budget in budgets)
                {
                    // Calculate total spending for this category in the month
                    var spending = await _context.Transactions
                        .Where(t => t.UserId == userId 
                            && t.CategoryId == budget.CategoryId
                            && t.Type == "expense"
                            && t.Date.Year == targetYear 
                            && t.Date.Month == targetMonth)
                        .SumAsync(t => t.Amount);

                    var percentageUsed = budget.Amount > 0 ? (spending / budget.Amount * 100) : 0;

                    budgetStatus.Add(new BudgetStatusItemDto
                    {
                        BudgetId = budget.Id,
                        CategoryId = budget.CategoryId,
                        CategoryName = budget.Category?.Name ?? "Unknown",
                        BudgetAmount = budget.Amount,
                        Spending = spending,
                        Remaining = budget.Amount - spending,
                        PercentageUsed = (decimal)percentageUsed,
                        IsOverBudget = spending > budget.Amount
                    });
                }

                var totalBudget = budgets.Sum(b => b.Amount);
                var totalSpending = budgetStatus.Sum(b => b.Spending);

                return Ok(new BudgetStatusDto
                {
                    Month = targetMonth,
                    Year = targetYear,
                    TotalBudget = totalBudget,
                    TotalSpending = totalSpending,
                    TotalRemaining = totalBudget - totalSpending,
                    TotalPercentageUsed = totalBudget > 0 ? (totalSpending / totalBudget * 100) : 0,
                    Items = budgetStatus
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // GET: api/budgets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            try
            {
                var userId = GetUserId();
                var budget = await _context.Budgets
                    .Include(b => b.Category)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (budget == null)
                    return NotFound(new { error = "Budget not found" });

                // Verify user owns this budget
                if (budget.UserId != userId)
                    return Forbid();

                return Ok(budget);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // POST: api/budgets
        [HttpPost]
        public async Task<ActionResult<Budget>> CreateBudget([FromBody] CreateBudgetDto dto)
        {
            try
            {
                var userId = GetUserId();

                // Validate input
                if (dto.Amount <= 0)
                    return BadRequest(new { error = "Budget amount must be greater than 0" });

                if (dto.Month < 1 || dto.Month > 12)
                    return BadRequest(new { error = "Invalid month (must be 1-12)" });

                if (dto.Year < 2000 || dto.Year > DateTime.Now.Year + 10)
                    return BadRequest(new { error = "Invalid year" });

                // Verify category exists and belongs to user
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && c.UserId == userId);

                if (category == null)
                    return BadRequest(new { error = "Category not found or does not belong to user" });

                // Check if budget already exists for this category/month/year
                var existingBudget = await _context.Budgets
                    .FirstOrDefaultAsync(b => b.UserId == userId 
                        && b.CategoryId == dto.CategoryId 
                        && b.Month == dto.Month 
                        && b.Year == dto.Year);

                if (existingBudget != null)
                    return BadRequest(new { error = "Budget already exists for this category and month" });

                var budget = new Budget
                {
                    UserId = userId,
                    CategoryId = dto.CategoryId,
                    Amount = dto.Amount,
                    Month = dto.Month,
                    Year = dto.Year
                };

                _context.Budgets.Add(budget);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // PUT: api/budgets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetDto dto)
        {
            try
            {
                var userId = GetUserId();
                var budget = await _context.Budgets.FindAsync(id);

                if (budget == null)
                    return NotFound(new { error = "Budget not found" });

                // Verify user owns this budget
                if (budget.UserId != userId)
                    return Forbid();

                // Validate input
                if (dto.Amount <= 0)
                    return BadRequest(new { error = "Budget amount must be greater than 0" });

                budget.Amount = dto.Amount;

                _context.Budgets.Update(budget);
                await _context.SaveChangesAsync();

                return Ok(budget);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }

        // DELETE: api/budgets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            try
            {
                var userId = GetUserId();
                var budget = await _context.Budgets.FindAsync(id);

                if (budget == null)
                    return NotFound(new { error = "Budget not found" });

                // Verify user owns this budget
                if (budget.UserId != userId)
                    return Forbid();

                _context.Budgets.Remove(budget);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { error = "Not authenticated" });
            }
        }
    }

    public class CreateBudgetDto
    {
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public class UpdateBudgetDto
    {
        public decimal Amount { get; set; }
    }

    public class BudgetStatusItemDto
    {
        public int BudgetId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal BudgetAmount { get; set; }
        public decimal Spending { get; set; }
        public decimal Remaining { get; set; }
        public decimal PercentageUsed { get; set; }
        public bool IsOverBudget { get; set; }
    }

    public class BudgetStatusDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal TotalBudget { get; set; }
        public decimal TotalSpending { get; set; }
        public decimal TotalRemaining { get; set; }
        public decimal TotalPercentageUsed { get; set; }
        public List<BudgetStatusItemDto> Items { get; set; } = new();
    }
}
