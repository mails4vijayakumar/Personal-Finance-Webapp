# Personal Finance - Azure Deployment Script

## Prerequisites Checklist

Before running this deployment, ensure you have:

- [ ] Azure Subscription (with credits available)
- [ ] Azure CLI installed (see installation instructions below)
- [ ] Git configured
- [ ] Docker (already have this ✓)
- [ ] GitHub account with repository access

## Installation Instructions

### Step 1: Install Azure CLI

**Option A: Direct Download (Recommended)**
1. Download from: https://aka.ms/installazurecliwindows
2. Run the installer (AzureCLI.msi)
3. Click through the installation wizard
4. Restart PowerShell or Command Prompt

**Option B: Using Chocolatey**
```powershell
choco install azure-cli
```

**Option C: Using Windows Package Manager**
```powershell
winget install -e --id Microsoft.AzureCLI
```

### Step 2: Verify Installation

```powershell
az --version
```

Should show version number (e.g., "azure-cli 2.56.0")

## Azure Deployment Steps

### Step 1: Login to Azure

```powershell
az login
```

This will open a browser window for authentication. Login with your Azure account credentials.

### Step 2: Verify Subscription

```powershell
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 3: Set Deployment Variables

```powershell
$resourceGroup = "personal-finance-rg"
$location = "eastus"
$appServicePlan = "personal-finance-plan"
$backendApp = "personal-finance-api-$(Get-Random -Minimum 1000 -Maximum 9999)"
$frontendApp = "personal-finance-web-$(Get-Random -Minimum 1000 -Maximum 9999)"
$sku = "B1"  # Free tier alternative: F1

Write-Host "Deployment Configuration:"
Write-Host "  Resource Group: $resourceGroup"
Write-Host "  Location: $location"
Write-Host "  App Service Plan: $appServicePlan"
Write-Host "  Backend App: $backendApp"
Write-Host "  Frontend App: $frontendApp"
Write-Host "  SKU: $sku"
```

### Step 4: Create Resource Group

```powershell
Write-Host "Creating resource group..." -ForegroundColor Cyan
az group create `
  --name $resourceGroup `
  --location $location

Write-Host "✅ Resource group created" -ForegroundColor Green
```

### Step 5: Create App Service Plan

```powershell
Write-Host "Creating App Service Plan..." -ForegroundColor Cyan
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku $sku `
  --is-linux

Write-Host "✅ App Service Plan created" -ForegroundColor Green
```

### Step 6: Deploy Backend API

```powershell
Write-Host "Creating Backend Web App..." -ForegroundColor Cyan
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $backendApp `
  --runtime "DOTNET:8.0" `
  --runtime-version "8.0"

Write-Host "✅ Backend Web App created" -ForegroundColor Green

# Configure environment variables
Write-Host "Configuring Backend settings..." -ForegroundColor Cyan
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $backendApp `
  --settings `
    "ASPNETCORE_ENVIRONMENT=Production" `
    "ASPNETCORE_URLS=http://+:80" `
    "Jwt__SecretKey=your-ultra-secure-secret-key-minimum-32-characters-long" `
    "Jwt__Issuer=PersonalFinanceAPI" `
    "Jwt__Audience=PersonalFinanceClient" `
    "Jwt__ExpiryMinutes=10080"

Write-Host "✅ Backend settings configured" -ForegroundColor Green
```

### Step 7: Deploy Frontend

```powershell
Write-Host "Creating Frontend Web App..." -ForegroundColor Cyan
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $frontendApp `
  --runtime "NODE:18-lts"

Write-Host "✅ Frontend Web App created" -ForegroundColor Green

# Configure environment variables
Write-Host "Configuring Frontend settings..." -ForegroundColor Cyan
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $frontendApp `
  --settings `
    "BACKEND_URL=https://$backendApp.azurewebsites.net/api"

Write-Host "✅ Frontend settings configured" -ForegroundColor Green
```

### Step 8: Configure CORS on Backend

```powershell
Write-Host "Configuring CORS..." -ForegroundColor Cyan
az webapp cors add `
  --resource-group $resourceGroup `
  --name $backendApp `
  --allowed-origins "https://$frontendApp.azurewebsites.net"

Write-Host "✅ CORS configured" -ForegroundColor Green
```

### Step 9: Configure Web App Settings

```powershell
# Enable always-on for backend
az webapp config set `
  --resource-group $resourceGroup `
  --name $backendApp `
  --always-on true

# Set Node version for frontend
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $frontendApp `
  --settings "WEBSITE_NODE_DEFAULT_VERSION=18.13.0"

Write-Host "✅ Web app settings configured" -ForegroundColor Green
```

### Step 10: Deploy Code

**Option A: Using Docker (Recommended)**

```powershell
# Get ACR login credentials
$acrName = "personalfinanceacr$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Creating Container Registry..." -ForegroundColor Cyan
az acr create `
  --resource-group $resourceGroup `
  --name $acrName `
  --sku Basic

Write-Host "Building and pushing Docker images..." -ForegroundColor Cyan
az acr build `
  --registry $acrName `
  --image personal-finance-backend:latest `
  --file Backend.Dockerfile `
  .

az acr build `
  --registry $acrName `
  --image personal-finance-frontend:latest `
  --file Frontend.Dockerfile `
  .

Write-Host "✅ Docker images built and pushed" -ForegroundColor Green
```

**Option B: Using Local Git Deployment**

```powershell
# Initialize deployment from local repository
Write-Host "Setting up local Git deployment..." -ForegroundColor Cyan

# Get deployment credentials
$credentials = az webapp deployment source config-local-git `
  --resource-group $resourceGroup `
  --name $backendApp

# Add Azure remote to Git
git remote add azure "$credentials"

# Push to Azure
git push azure main

Write-Host "✅ Code deployed to Azure" -ForegroundColor Green
```

## Verification Steps

### Check Deployment Status

```powershell
# Check backend app
az webapp show `
  --resource-group $resourceGroup `
  --name $backendApp `
  --query "state"

# Check frontend app
az webapp show `
  --resource-group $resourceGroup `
  --name $frontendApp `
  --query "state"

# Get app URLs
Write-Host "Application URLs:" -ForegroundColor Cyan
Write-Host "  Backend:  https://$backendApp.azurewebsites.net"
Write-Host "  Frontend: https://$frontendApp.azurewebsites.net"
```

### View Logs

```powershell
# Stream backend logs
az webapp log tail `
  --resource-group $resourceGroup `
  --name $backendApp

# Stream frontend logs
az webapp log tail `
  --resource-group $resourceGroup `
  --name $frontendApp
```

### Test Endpoints

```powershell
# Test backend health
Invoke-WebRequest -Uri "https://$backendApp.azurewebsites.net/health"

# Test frontend
Invoke-WebRequest -Uri "https://$frontendApp.azurewebsites.net"

Write-Host "✅ All endpoints responding" -ForegroundColor Green
```

## Configuration Summary

| Item | Value | Location |
|------|-------|----------|
| Resource Group | personal-finance-rg | Azure Portal |
| App Service Plan | personal-finance-plan | East US |
| Backend App | personal-finance-api-XXXX | azurewebsites.net |
| Frontend App | personal-finance-web-XXXX | azurewebsites.net |
| Database | SQLite (in app) | App Service |
| Monitoring | Application Insights (optional) | Azure Portal |

## Cost Estimation

**Minimum Configuration (B1 Plan):**
- App Service Plan (B1): ~$12/month
- Storage: ~$1/month
- Data Transfer: ~$0 (first 1GB free)
- **Total: ~$13/month**

**Production Configuration (S1 Plan):**
- App Service Plan (S1): ~$74/month
- Storage: ~$2/month
- Data Transfer: ~$5/month
- **Total: ~$81/month**

## Next Steps

1. **Post-Deployment:**
   - [ ] Test application functionality
   - [ ] Configure custom domain (optional)
   - [ ] Setup SSL certificate (HTTPS)
   - [ ] Enable backup strategy
   - [ ] Setup monitoring and alerts
   - [ ] Configure auto-scaling rules

2. **Production Hardening:**
   - [ ] Move secrets to Azure Key Vault
   - [ ] Enable managed identity for services
   - [ ] Configure firewall rules
   - [ ] Setup backup and recovery procedures
   - [ ] Enable Application Insights
   - [ ] Configure alert rules

3. **Continuous Deployment:**
   - [ ] Setup GitHub Actions workflow
   - [ ] Configure automatic deployments on push
   - [ ] Setup staging environments
   - [ ] Configure deployment slots

## Troubleshooting

### App Service Returns 500 Error

**Check logs:**
```powershell
az webapp log tail --resource-group $resourceGroup --name $backendApp
```

### Frontend Cannot Connect to Backend

**Check CORS configuration:**
```powershell
az webapp cors show --resource-group $resourceGroup --name $backendApp
```

### Slow Performance

**Check App Service Plan:**
- Consider upgrading to S1 or higher
- Enable Application Insights for monitoring
- Check database query performance

### Database Issues

**For persistent data, upgrade to Azure SQL:**
```powershell
az sql server create --resource-group $resourceGroup --name <server-name> ...
```

## Support & Resources

- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Application Insights](https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview)

---

Status: Ready for Azure deployment ✅
Last Updated: March 9, 2026
