using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceAPI.Data;
using PersonalFinanceAPI.Models;
using ClosedXML.Excel;

namespace PersonalFinanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            throw new UnauthorizedAccessException("User not authenticated");
        return userId;
    }

    // GET: api/transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions(
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? type = null)
    {
        try
        {
            var userId = GetUserId();
            
            var query = _context.Transactions
                .Where(t => t.UserId == userId)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
                query = query.Where(t => t.Description.Contains(search));

            if (categoryId.HasValue)
                query = query.Where(t => t.CategoryId == categoryId);

            if (startDate.HasValue)
                query = query.Where(t => t.Date >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(t => t.Date <= endDate.Value.AddDays(1));

            if (!string.IsNullOrEmpty(type) && (type.ToLower() == "income" || type.ToLower() == "expense"))
                query = query.Where(t => t.Type == type.ToLower());

            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();

            return Ok(transactions);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }
    }

    // GET: api/transactions/summary
    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetSummary()
    {
        try
        {
            var userId = GetUserId();
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();
            
            var totalIncome = transactions
                .Where(t => t.Type.ToLower() == "income")
                .Sum(t => t.Amount);
            
            var totalExpenses = transactions
                .Where(t => t.Type.ToLower() == "expense")
                .Sum(t => t.Amount);
            
            var balance = totalIncome - totalExpenses;

            return Ok(new
            {
                balance = Math.Round(balance, 2),
                totalIncome = Math.Round(totalIncome, 2),
                totalExpenses = Math.Round(totalExpenses, 2)
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }
    }

    // POST: api/transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        try
        {
            var userId = GetUserId();

            // Validation
            if (string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { error = "Description is required" });

            if (dto.Amount <= 0)
                return BadRequest(new { error = "Amount must be greater than 0" });

            if (string.IsNullOrWhiteSpace(dto.Type) || 
                (dto.Type.ToLower() != "income" && dto.Type.ToLower() != "expense"))
                return BadRequest(new { error = "Type must be 'income' or 'expense'" });

            // Validate category belongs to user if provided
            if (dto.CategoryId.HasValue)
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && c.UserId == userId);
                
                if (category == null)
                    return BadRequest(new { error = "Category not found or doesn't belong to user" });
            }

            var transaction = new Transaction
            {
                UserId = userId,
                Description = dto.Description.Trim(),
                Amount = dto.Amount,
                Type = dto.Type.ToLower(),
                CategoryId = dto.CategoryId,
                Date = dto.Date ?? DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactions), new { id = transaction.Id }, transaction);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }
    }

    // DELETE: api/transactions/{id}
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        try
        {
            var userId = GetUserId();
            var transaction = await _context.Transactions.FindAsync(id);
            
            if (transaction == null)
                return NotFound(new { error = "Transaction not found" });

            // Verify user owns this transaction
            if (transaction.UserId != userId)
                return Forbid();

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }
    }

    // POST: api/transactions/upload
    [Authorize]
    [HttpPost("upload")]
    public async Task<ActionResult<object>> UploadTransactions([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "No file provided" });

        // Validate file extension
        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { error = "Only Excel files (.xlsx, .xls) are allowed" });

        try
        {
            var userId = GetUserId();
            var transactions = new List<Transaction>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                stream.Position = 0;

                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1);
                    var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header row

                    foreach (var row in rows)
                    {
                        try
                        {
                            // Bank statement format:
                            // Column A: Date
                            // Column B: Narration (Description)
                            // Column C: Chq./Ref.No
                            // Column D: Withdrawal Amt. (Expense)
                            // Column E: Deposit Amt. (Income)

                            var dateStr = row.Cell(1).GetString()?.Trim();
                            var narration = row.Cell(2).GetString()?.Trim();
                            var cheqRefNo = row.Cell(3).GetString()?.Trim();
                            var withdrawalStr = row.Cell(4).GetString()?.Trim();
                            var depositStr = row.Cell(5).GetString()?.Trim();

                            // Parse date
                            var date = DateTime.UtcNow;
                            if (!string.IsNullOrEmpty(dateStr))
                            {
                                if (DateTime.TryParse(dateStr, out var parsedDate))
                                    date = parsedDate;
                            }

                            // Validation - narration is required
                            if (string.IsNullOrEmpty(narration))
                                continue;

                            // Build description with reference number if available
                            var description = narration;
                            if (!string.IsNullOrEmpty(cheqRefNo))
                                description = $"{narration} (Ref: {cheqRefNo})";

                            // Determine amount and type based on withdrawal/deposit columns
                            decimal amount = 0;
                            string type = "expense";
                            bool hasAmount = false;

                            if (!string.IsNullOrEmpty(withdrawalStr) && decimal.TryParse(withdrawalStr, out var withdrawalAmount) && withdrawalAmount > 0)
                            {
                                amount = withdrawalAmount;
                                type = "expense";
                                hasAmount = true;
                            }
                            else if (!string.IsNullOrEmpty(depositStr) && decimal.TryParse(depositStr, out var depositAmount) && depositAmount > 0)
                            {
                                amount = depositAmount;
                                type = "income";
                                hasAmount = true;
                            }

                            // Skip if no valid amount found
                            if (!hasAmount || amount <= 0)
                                continue;

                            transactions.Add(new Transaction
                            {
                                UserId = userId,
                                Description = description,
                                Amount = amount,
                                Type = type,
                                Date = date,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                        catch
                        {
                            // Skip invalid rows
                            continue;
                        }
                    }
                }
            }

            if (transactions.Count == 0)
                return BadRequest(new { error = "No valid transactions found in the file" });

            // Bulk insert transactions
            _context.Transactions.AddRange(transactions);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Successfully imported {transactions.Count} transactions",
                count = transactions.Count,
                transactions = transactions.OrderByDescending(t => t.Date).ToList()
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Not authenticated" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Error processing file: {ex.Message}" });
        }
    }
}

public class CreateTransactionDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense"; // "income" or "expense"
    public DateTime? Date { get; set; }
    public int? CategoryId { get; set; } // Optional category assignment
}
