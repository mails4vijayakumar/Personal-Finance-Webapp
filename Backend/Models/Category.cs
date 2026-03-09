namespace PersonalFinanceAPI.Models;

public class Category
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string? ColorHex { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User? User { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
