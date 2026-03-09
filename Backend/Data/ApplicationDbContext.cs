using Microsoft.EntityFrameworkCore;
using PersonalFinanceAPI.Models;

namespace PersonalFinanceAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Transaction> Transactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Transaction entity
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .IsRequired();
            
            entity.Property(e => e.Type)
                .IsRequired()
                .HasMaxLength(20);
            
            entity.Property(e => e.Date)
                .IsRequired();
            
            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}
