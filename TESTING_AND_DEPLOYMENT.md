# Personal Finance Application - Testing & Deployment Guide

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Environment Setup](#environment-setup)
3. [Running Tests](#running-tests)
4. [Deployment Checklist](#deployment-checklist)
5. [Production Configuration](#production-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Testing Strategy

### Test Coverage

| Component | Test Type | Status |
|-----------|-----------|--------|
| Authentication | Unit & Integration | ✅ Implemented |
| Transactions (CRUD) | Unit & Integration | ✅ Implemented |
| Categories (CRUD) | Unit & Integration | ✅ Implemented |
| Budgets (CRUD) | Unit & Integration | ✅ Implemented |
| Search & Filtering | Integration | ✅ Implemented |
| Reports & Charts | Visual | ✅ Manual Testing |

### Test Files Location

```
Frontend/
├── __tests__/
│   ├── Auth.test.jsx                 # Authentication tests
│   ├── Transactions.test.jsx         # Transaction CRUD tests
│   ├── Categories.test.jsx           # Category CRUD tests
│   └── Budgets.test.jsx              # Budget management tests
```

### Test Scenarios Covered

#### Authentication Tests
- ✅ User registration with valid/invalid credentials
- ✅ User login with correct/incorrect passwords
- ✅ Token generation and validation
- ✅ Token expiration handling
- ✅ Session management

#### Transaction Tests
- ✅ Create income and expense transactions
- ✅ Transaction validation
- ✅ Search functionality
- ✅ Filter by category, type, date range
- ✅ Update and delete transactions
- ✅ Summary calculations

#### Category Tests
- ✅ Create, read, update, delete categories
- ✅ Color validation
- ✅ Duplicate prevention
- ✅ Category assignment to transactions

#### Budget Tests
- ✅ Budget creation and updates
- ✅ Budget vs spending comparison
- ✅ Overspending detection
- ✅ Budget status calculation
- ✅ Monthly tracking

---

## Environment Setup

### Prerequisites

- Node.js 18.x or higher
- .NET 8 or higher
- SQLite3
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies (if using npm)
npm install

# Or restore NuGet packages
dotnet restore

# Set environment to Development
# On Windows (PowerShell)
$env:ASPNETCORE_ENVIRONMENT = "Development"

# On Linux/Mac
export ASPNETCORE_ENVIRONMENT=Development

# Apply database migrations
dotnet ef database update

# Run backend server
dotnet run
```

Backend will be available at: `http://localhost:5000` (or your configured port)

### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Set environment variables (create .env.local)
VITE_API_URL=http://localhost:5000

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Environment Variables

#### Backend (`appsettings.Development.json`)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=PersonalFinance.db"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-chars-long",
    "Issuer": "PersonalFinanceAPI",
    "Audience": "PersonalFinanceClient",
    "ExpiryMinutes": 10080
  }
}
```

#### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Personal Finance Tracker
```

---

## Running Tests

### Setup Test Environment

```bash
# Install testing dependencies
cd Frontend
npm install --save-dev vitest

# Update package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Run Test Suites

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- Auth.test.jsx

# Generate coverage report
npm run test:coverage
```

### Expected Test Results

All tests should pass with output similar to:

```
✓ __tests__/Auth.test.jsx (5 tests) 
✓ __tests__/Transactions.test.jsx (8 tests)
✓ __tests__/Categories.test.jsx (6 tests)
✓ __tests__/Budgets.test.jsx (9 tests)

Pass: 28 | Fail: 0 | Duration: 250ms
```

---

## Deployment Checklist

### Pre-Deployment Verification

- [ ] All tests passing
- [ ] No console warnings or errors
- [ ] Code review completed
- [ ] Dependencies updated and audited
- [ ] Security vulnerabilities fixed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup of production database created

### Frontend Build

```bash
cd Frontend

# Build for production
npm run build

# Verify build output
# Should create dist/ folder with optimized assets

# Test production build locally
npm run preview
```

### Backend Build

```bash
cd Backend

# Build for production
dotnet build -c Release

# Publish for deployment
dotnet publish -c Release -o ./publish
```

### Database Migration

```bash
# Create migration for any pending schema changes
dotnet ef migrations add MigrationName

# Apply migrations to production
dotnet ef database update --environment Production
```

---

## Production Configuration

### Backend Production Settings (`appsettings.Production.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning",
      "Personal Finance": "Information"
    }
  },
  "AllowedHosts": "yourdomain.com,www.yourdomain.com",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=/data/PersonalFinance.db"
  },
  "Jwt": {
    "SecretKey": "use-strong-secure-key-minimum-32-characters",
    "Issuer": "PersonalFinanceAPI",
    "Audience": "PersonalFinanceClient",
    "ExpiryMinutes": 10080
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:80"
      },
      "Https": {
        "Url": "https://0.0.0.0:443",
        "Certificate": {
          "Path": "/certs/cert.pfx",
          "Password": "your-certificate-password"
        }
      }
    }
  }
}
```

### Frontend Production Environment (`.env.production`)

```
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=Personal Finance Tracker
```

### CORS Configuration

```csharp
// In Program.cs
services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", builder =>
    {
        builder
            .WithOrigins("https://yourdomain.com", "https://www.yourdomain.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

app.UseCors("ProductionPolicy");
```

---

## Deployment Platforms

### Option 1: Azure App Service

```bash
# Install Azure CLI
# Then login
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1

# Create web app for backend
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myfinanceapi

# Deploy backend
cd Backend
dotnet publish -c Release
# Upload publish folder to Azure App Service

# Deploy frontend (upload dist folder to static hosting)
cd Frontend
npm run build
# Use Azure Static Web Apps or similar service
```

### Option 2: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8 AS build
WORKDIR /app
COPY Backend/ .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 80
ENTRYPOINT ["dotnet", "PersonalFinanceAPI.dll"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Backend.Dockerfile
    ports:
      - "5000:80"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: Data Source=/data/finance.db
    volumes:
      - ./data:/data

  frontend:
    build:
      context: .
      dockerfile: Frontend.Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
```

---

## Monitoring & Maintenance

### Application Health Checks

```csharp
// Add to Program.cs
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
```

### Logging Best Practices

```csharp
// Backend logging
logger.LogInformation("User {UserId} logged in", userId);
logger.LogError("Failed to process transaction {@Transaction}", transaction);

// Frontend logging
console.info('User action:', action)
console.error('API error:', error)
```

### Backup Strategy

```bash
# Daily backup
# On Azure: Enable automated backups in App Service
# On Docker: Mount volume with backup script

# Example backup script (Linux)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /data/PersonalFinance.db /backups/PersonalFinance_$DATE.db
```

### Performance Monitoring

- Monitor API response times
- Track database query performance
- Monitor front-end bundle size
- Track error rates
- Monitor server resource usage

### Security Maintenance

- [ ] Keep dependencies updated: `npm audit`, `dotnet package`
- [ ] Rotate JWT secrets regularly
- [ ] Review and rotate SSL certificates
- [ ] Monitor security advisories
- [ ] Implement rate limiting
- [ ] Enable HTTPS everywhere
- [ ] Use environment variables for secrets

---

## Post-Deployment Steps

1. **Verify Deployment**
   ```bash
   curl https://yourdomain.com/health
   ```

2. **Test Core Features**
   - [ ] User registration
   - [ ] User login
   - [ ] Add transaction
   - [ ] View reports
   - [ ] Create budget

3. **Monitor Logs**
   - Check application logs for errors
   - Monitor error rates
   - Track response times

4. **Update DNS**
   - Point domain to production server
   - Update HTTPS certificates

5. **Communicate Launch**
   - Notify users of availability
   - Share access credentials
   - Document support process

---

## Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| Database connection error | Check connection string and file permissions |
| CORS error | Review allowed origins in appsettings |
| Token validation fails | Verify JWT secret key matches frontend config |
| 404 endpoints error | Ensure all migrations applied and routes mapped |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| API calls fail | Verify VITE_API_URL environment variable |
| Charts not rendering | Check Chart.js version compatibility |
| Login redirect loops | Clear browser localStorage and cookies |
| Styles not loading | Verify CSS import paths and build output |

### Database Issues

```bash
# Reset database (development only)
dotnet ef database update 0
dotnet ef database update

# Check migration status
dotnet ef migrations list
```

---

## Support & Updates

For issues or questions:
- Check GitHub Issues: https://github.com/yourusername/personal-finance
- Review documentation: See README.md
- Contact support: support@yourdomain.com

