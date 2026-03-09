namespace PersonalFinanceAPI.Models;

public class Budget
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public int CategoryId { get; set; }
    
    public decimal Amount { get; set; }
    
    public int Month { get; set; } // 1-12
    
    public int Year { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User? User { get; set; }
    public Category? Category { get; set; }
}
