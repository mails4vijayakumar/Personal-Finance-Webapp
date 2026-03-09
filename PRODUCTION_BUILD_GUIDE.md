# Personal Finance Application - Production Build Guide

## Overview

This guide covers optimizing the Personal Finance Application for production deployment with best practices for performance, security, and reliability.

---

## Backend Optimization

### 1. Enable Entity Framework Core Caching

```csharp
// In Program.cs
services.AddDbContext<FinanceDbContext>(options =>
    options.UseSqlite(connection)
        .EnableDetailedErrors(false)  // Disable in production
        .EnableSensitiveDataLogging(false));  // Disable in production

// Add response caching
services.AddResponseCaching();
app.UseResponseCaching();
```

### 2. Add Output Caching

```csharp
// Cache category list (rarely changes)
[HttpGet]
[ResponseCache(Duration = 300)] // 5 minutes
public async Task<IActionResult> GetCategories()
{
    var categories = await _context.Categories
        .AsNoTracking()
        .ToListAsync();
    return Ok(categories);
}
```

### 3. API Compression

```csharp
// In Program.cs
services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json" });
});

app.UseResponseCompression();
```

### 4. Database Connection Pooling

```csharp
// In appsettings.Production.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=PersonalFinance.db;Pooling=true;Min Pool Size=5;Max Pool Size=20;"
  }
}
```

### 5. Rate Limiting

```csharp
// Add AspNetCoreRateLimit NuGet package
services.AddMemoryCache();
services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 100
        }
    };
});

services.AddInMemoryRateLimiting();
services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
app.UseIpRateLimiting();
```

---

## Frontend Optimization

### 1. Code Splitting

```javascript
// In App.jsx - Use React.lazy for route-based code splitting
import { lazy, Suspense } from 'react'

const ReportsPage = lazy(() => import('./components/ReportsPage'))
const BudgetsPage = lazy(() => import('./components/BudgetsPage'))

// In routes
<Suspense fallback={<LoadingSpinner />}>
    <ReportsPage />
</Suspense>
```

### 2. Image Optimization

```bash
# Install image optimization tool
npm install --save-dev vite-plugin-compression

# In vite.config.js
import compression from 'vite-plugin-compression'

export default {
  plugins: [
    compression({
      verbose: true,
      disable: false,
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
}
```

### 3. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# In vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true
    })
  ]
}
```

### 4. Minify and Tree-shake

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    sourcemap: false,  // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
}
```

### 5. CSS Optimization

```css
/* Use CSS variables for theming */
:root {
    --primary-color: #4a9eff;
    --bg-primary: #0f0f0f;
    --bg-secondary: #1a1a1a;
}

/* Minimize CSS with PurgeCSS */
/* Vite automatically optimizes CSS in production */
```

---

## Performance Benchmarks

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| API Response Time | < 200ms | Response headers |
| Bundle Size | < 300KB | npm run build |
| Lighthouse Score | > 90 | Lighthouse audit |

### Performance Testing

```bash
# Test production build locally
npm run build
npm run preview

# Run Lighthouse audit
npm install --save-dev @lhci/cli@0.8.x @lhci/server@0.8.x
npm run lhci autorun

# Bundle analysis
npm run build -- --visualizer
```

---

## Security Hardening

### 1. HTTPS Configuration

```csharp
// Force HTTPS
app.UseHttpsRedirection();
app.UseHsts();  // HTTP Strict Transport Security

// In appsettings.Production.json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://:443",
        "Certificate": {
          "Path": "/certs/certificate.pfx",
          "Password": "${CERT_PASSWORD}"
        }
      }
    }
  }
}
```

### 2. Security Headers

```csharp
// Add security middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});
```

### 3. Input Validation

```csharp
// Validate all inputs
[HttpPost]
public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    if (request.Amount <= 0)
        return BadRequest("Amount must be positive");

    // Process...
}
```

### 4. SQL Injection Prevention

```csharp
// Always use parameterized queries with EF Core
var transactions = await _context.Transactions
    .FromSqlInterpolated($"SELECT * FROM Transactions WHERE Description LIKE {searchTerm}%")
    .ToListAsync();

// Not vulnerable: EF Core handles parameterization
```

### 5. API Authentication

```csharp
// Require authentication on protected endpoints
[Authorize]
[HttpGet]
public async Task<IActionResult> GetTransactions()
{
    var userId = User.FindFirst("sub")?.Value;
    var transactions = await _context.Transactions
        .Where(t => t.UserId == userId)
        .ToListAsync();
    return Ok(transactions);
}
```

---

## Deployment Environment Variables

### Backend (.env or System Environment)

```
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://+:443;http://+:80
ConnectionStrings__DefaultConnection=Data Source=/data/finance.db
Jwt__SecretKey=your-ultra-secure-secret-key-minimum-32-chars-long
Jwt__Issuer=PersonalFinanceAPI
Jwt__Audience=PersonalFinanceClient
Jwt__ExpiryMinutes=10080
CERT_PASSWORD=your-certificate-password
```

### Frontend (.env.production)

```
VITE_API_URL=https://yourdomain.com
VITE_APP_NAME=Personal Finance Tracker
```

---

## CI/CD Pipeline Example (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./Frontend
      
      - name: Run tests
        run: npm test
        working-directory: ./Frontend
      
      - name: Build frontend
        run: npm run build
        working-directory: ./Frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0'
      
      - name: Build backend
        run: dotnet build -c Release
        working-directory: ./Backend
      
      - name: Deploy to Azure
        run: |
          dotnet publish -c Release -o publish
          # Deploy publish folder
        working-directory: ./Backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/Frontend/dist'
          api_location: ''
          output_location: ''
```

---

## Monitoring Setup

### Application Insights (Azure)

```csharp
// Install NuGet package
// install-package Microsoft.ApplicationInsights.AspNetCore

// In Program.cs
services.AddApplicationInsightsTelemetry();

// Track custom events
private readonly TelemetryClient _telemetryClient;

public void TrackTransactionCreated(int userId)
{
    _telemetryClient.TrackEvent("TransactionCreated", 
        new Dictionary<string, string> { { "UserId", userId.ToString() } });
}
```

### Health Checks

```csharp
services.AddHealthChecks()
    .AddDbContextCheck<FinanceDbContext>()
    .AddCheck("memory", new MemoryHealthCheck())
    .AddCheck("disk", new DiskHealthCheck());

app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = r => r.Name.Contains("live")
});
```

---

## Rollback Strategy

```bash
# Keep previous versions
# Tag production releases
git tag -a v1.0.0-prod -m "Production release"
git push origin v1.0.0-prod

# Rollback if needed
git checkout v1.0.0-prod
dotnet publish -c Release
```

---

## Success Criteria

After deployment, verify:

- ✅ All pages load within 2 seconds
- ✅ API responses average < 200ms
- ✅ Zero security vulnerabilities (npm audit, dotnet package)
- ✅ Lighthouse score > 90
- ✅ 99.9% uptime
- ✅ All features working as expected
- ✅ User feedback positive
- ✅ Database backups working

