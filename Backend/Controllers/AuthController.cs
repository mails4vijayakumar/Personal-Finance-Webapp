using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalFinanceAPI.Data;
using PersonalFinanceAPI.Models;
using PersonalFinanceAPI.Utilities;

namespace PersonalFinanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] RegisterDto dto)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(dto.Username) || dto.Username.Length < 3)
            return BadRequest(new { error = "Username must be at least 3 characters" });

        if (string.IsNullOrWhiteSpace(dto.Email) || !dto.Email.Contains("@"))
            return BadRequest(new { error = "Valid email is required" });

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            return BadRequest(new { error = "Password must be at least 6 characters" });

        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == dto.Username || u.Email == dto.Email);

        if (existingUser != null)
            return BadRequest(new { error = "Username or email already exists" });

        try
        {
            // Hash password
            var passwordHash = PasswordHasher.HashPassword(dto.Password);

            // Create new user
            var user = new User
            {
                Username = dto.Username.Trim(),
                Email = dto.Email.Trim(),
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token
            var secretKey = _configuration["Jwt:SecretKey"] ?? "super-secret-key-change-this-in-production";
            var token = JwtTokenGenerator.GenerateToken(user.Id, user.Username, user.Email, secretKey);

            return Ok(new
            {
                message = "User registered successfully",
                token = token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Registration failed: {ex.Message}" });
        }
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<object>> Login([FromBody] LoginDto dto)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { error = "Username and password required" });

        try
        {
            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized(new { error = "Invalid username or password" });

            // Generate JWT token
            var secretKey = _configuration["Jwt:SecretKey"] ?? "super-secret-key-change-this-in-production";
            var token = JwtTokenGenerator.GenerateToken(user.Id, user.Username, user.Email, secretKey);

            return Ok(new
            {
                message = "Login successful",
                token = token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    email = user.Email
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"Login failed: {ex.Message}" });
        }
    }

    // GET: api/auth/profile
    [HttpGet("profile")]
    public async Task<ActionResult<object>> GetProfile()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized(new { error = "User not authenticated" });

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound(new { error = "User not found" });

        return Ok(new
        {
            id = user.Id,
            username = user.Username,
            email = user.Email,
            createdAt = user.CreatedAt
        });
    }
}

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
