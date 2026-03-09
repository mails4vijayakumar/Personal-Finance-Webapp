using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceAPI.Data;
using PersonalFinanceAPI.Models;

namespace PersonalFinanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/transactions
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        var transactions = await _context.Transactions
            .OrderByDescending(t => t.Date)
            .ToListAsync();
        return Ok(transactions);
    }

    // GET: api/transactions/summary
    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetSummary()
    {
        var transactions = await _context.Transactions.ToListAsync();
        
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

    // POST: api/transactions
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(dto.Description))
            return BadRequest(new { error = "Description is required" });

        if (dto.Amount <= 0)
            return BadRequest(new { error = "Amount must be greater than 0" });

        if (string.IsNullOrWhiteSpace(dto.Type) || 
            (dto.Type.ToLower() != "income" && dto.Type.ToLower() != "expense"))
            return BadRequest(new { error = "Type must be 'income' or 'expense'" });

        var transaction = new Transaction
        {
            Description = dto.Description.Trim(),
            Amount = dto.Amount,
            Type = dto.Type.ToLower(),
            Date = dto.Date ?? DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransactions), new { id = transaction.Id }, transaction);
    }

    // DELETE: api/transactions/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var transaction = await _context.Transactions.FindAsync(id);
        if (transaction == null)
            return NotFound(new { error = "Transaction not found" });

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateTransactionDto
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense"; // "income" or "expense"
    public DateTime? Date { get; set; }
}
