# 🚀 Azure Deployment - Quick Start Guide

## Your Application Is Ready! ✅

Your Personal Finance Application is fully configured and ready for Azure deployment. Here's everything you need to know:

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Azure Account** - Create free account at https://azure.microsoft.com/free
2. **Azure CLI** - Download from https://aka.ms/installazurecliwindows
3. **Verify Installation** - Run in PowerShell/Command Prompt:
   ```
   az --version
   ```

---

## 🚀 Quick Deployment (5 minutes)

### Step 1: Download & Install Azure CLI

**Option A: Direct Download (Simplest)**
1. Go to: https://aka.ms/installazurecliwindows
2. Download `AzureCLI.msi`
3. Run installer, click through wizard
4. Restart PowerShell

**Option B: Using Package Manager**
```powershell
# Using Chocolatey
choco install azure-cli

# Or using Windows Package Manager
winget install -e --id Microsoft.AzureCLI
```

### Step 2: Login to Azure

```powershell
az login
```

A browser window opens for authentication. Login with your Azure account.

### Step 3: Run Deployment Script

```powershell
# Navigate to project folder
cd d:\POC\Personal-finance

# Run deployment script (automatic setup)
.\deploy-to-azure.ps1
```

**The script will:**
- ✅ Create resource group
- ✅ Create App Service Plan
- ✅ Deploy Backend API
- ✅ Deploy Frontend React App
- ✅ Configure CORS and settings
- ✅ Enable monitoring

### Step 4: Access Your App

After deployment completes, you'll see:
```
Frontend: https://personal-finance-web-XXXXX.azurewebsites.net
Backend:  https://personal-finance-api-XXXXX.azurewebsites.net
```

**That's it! Your app is live! 🎉**

---

## 📊 What Gets Created

| Resource | Type | Purpose | Cost |
|----------|------|---------|------|
| **Resource Group** | Logical Container | Organize all resources | Free |
| **App Service Plan** | Compute | Host your apps | ~$12/month (B1) |
| **Backend Web App** | .NET 8 Runtime | API Server | Included in plan |
| **Frontend Web App** | Node.js Runtime | React SPA | Included in plan |
| **Application Insights** | Optional | Monitoring | ~$2/month |
| **Storage Account** | Optional | Backups | ~$1/month |

**Total Estimated Cost:** $13-20/month (production cost included)

---

## 🔧 Manual Deployment (If Script Fails)

### Option A: Using Azure CLI Commands

```powershell
# 1. Login
az login

# 2. Create resource group
$resourceGroup = "personal-finance-rg"
$location = "eastus"

az group create --name $resourceGroup --location $location

# 3. Create App Service Plan
$appServicePlan = "personal-finance-plan"
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku B1 `
  --is-linux

# 4. Create Backend Web App
$backendApp = "personal-finance-api-12345"
az webapp create `
  --name $backendApp `
  --plan $appServicePlan `
  --resource-group $resourceGroup `
  --runtime "DOTNET:8.0"

# 5. Create Frontend Web App
$frontendApp = "personal-finance-web-12345"
az webapp create `
  --name $frontendApp `
  --plan $appServicePlan `
  --resource-group $resourceGroup `
  --runtime "NODE:18-lts"

# 6. Get URLs
Write-Host "Your application URLs:"
Write-Host "Backend:  https://$backendApp.azurewebsites.net"
Write-Host "Frontend: https://$frontendApp.azurewebsites.net"
```

### Option B: Using Azure Portal

1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Web App"
4. Click "Create"
5. Fill in details:
   - **Name:** personal-finance-api
   - **Runtime:** .NET 8
   - **Region:** East US
   - **App Service Plan:** Create new (B1)
6. Click "Review + Create" → "Create"
7. Repeat for Frontend with Node.js 18

---

## 📤 Deploy Your Code

### Option 1: Using Docker (Recommended)

```powershell
# Create Container Registry
$acrName = "personalfinanceacr$(Get-Random -Minimum 10000 -Maximum 99999)"
$resourceGroup = "personal-finance-rg"

az acr create `
  --resource-group $resourceGroup `
  --name $acrName `
  --sku Basic

# Build and push images
az acr build `
  --registry $acrName `
  --image personal-finance-backend:latest `
  --file Backend.Dockerfile .

az acr build `
  --registry $acrName `
  --image personal-finance-frontend:latest `
  --file Frontend.Dockerfile .

# Deploy from registry (see detailed guide for full steps)
```

### Option 2: Using Local Git (Simplest)

```powershell
# Enable local git deployment on backend
$backendApp = "personal-finance-api-12345"
$resourceGroup = "personal-finance-rg"

az webapp deployment source config-local-git `
  --resource-group $resourceGroup `
  --name $backendApp

# Add Azure remote
git remote add azure "https://$backendApp.scm.azurewebsites.net:443/$backendApp.git"

# Deploy
git push azure main

# Check deployment status
az webapp deployment list-publishing-profiles `
  --resource-group $resourceGroup `
  --name $backendApp `
  --xml
```

### Option 3: Using GitHub Actions (CI/CD)

See `AZURE_DEPLOYMENT.md` for GitHub Actions workflow setup for automatic deployments.

---

## ✅ Verification Checklist

After deployment, verify everything works:

```powershell
# Get deployed app URLs
$backendUrl = "https://personal-finance-api-XXXXX.azurewebsites.net"
$frontendUrl = "https://personal-finance-web-XXXXX.azurewebsites.net"

# Test backend API
Invoke-WebRequest -Uri "$backendUrl/health" -SkipHttpErrorCheck

# Test frontend
Invoke-WebRequest -Uri $frontendUrl -SkipHttpErrorCheck

# View logs
az webapp log tail --resource-group personal-finance-rg --name personal-finance-api-XXXXX

# Check app status
az webapp show --resource-group personal-finance-rg --name personal-finance-web-XXXXX --query state
```

---

## 🔐 Securing Your Deployment

### Add SSL/HTTPS

```powershell
# Azure handles free SSL by default at .azurewebsites.net
# For custom domains:

$backendApp = "personal-finance-api-12345"
$resourceGroup = "personal-finance-rg"
$customDomain = "api.yourdomain.com"

az webapp config hostname add `
  --resource-group $resourceGroup `
  --webapp-name $backendApp `
  --hostname $customDomain

# Then bind SSL certificate (Azure provides free wildcard certificate)
```

### Configure Security Headers

**Already configured in nginx.conf:**
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade

### Move Secrets to Key Vault

```powershell
# Create Key Vault
az keyvault create `
  --resource-group personal-finance-rg `
  --name personal-finance-kv

# Store JWT secret
az keyvault secret set `
  --vault-name personal-finance-kv `
  --name "JwtSecret" `
  --value "your-secret-key-here"

# Reference in app settings
az webapp config appsettings set `
  --resource-group personal-finance-rg `
  --name personal-finance-api-XXXXX `
  --settings "Jwt__SecretKey=@Microsoft.KeyVault(SecretUri=https://personal-finance-kv.vault.azure.net/secrets/JwtSecret/)"
```

---

## 📊 Monitor Your Application

### View Real-Time Logs

```powershell
# Stream backend logs
az webapp log tail `
  --resource-group personal-finance-rg `
  --name personal-finance-api-12345

# Stream frontend logs  
az webapp log tail `
  --resource-group personal-finance-rg `
  --name personal-finance-web-12345
```

### Enable Application Insights

```powershell
# Create Application Insights resource
az monitor app-insights component create `
  --app personal-finance-insights `
  --location eastus `
  --resource-group personal-finance-rg

# Link to backend app (configure in portal or CLI)
```

### Set Up Alerts

- CPU > 80%
- Memory > 80%  
- HTTP 4xx > 1% of requests
- HTTP 5xx > 0.1% of requests

---

## 💾 Backup & Disaster Recovery

### Automated Backups

```powershell
# Enable daily backups to storage account
$backendApp = "personal-finance-api-12345"
$resourceGroup = "personal-finance-rg"
$storageAccount = "personalfin$(Get-Random -Max 10000)"

# Create storage account
az storage account create `
  --name $storageAccount `
  --resource-group $resourceGroup `
  --location eastus `
  --sku Standard_LRS

# Configure backups (do in portal for now)
```

### Database Backups

SQLite database backed up to `/data/` volume which persists across restarts.

For production: **Migrate to Azure SQL Database** for automated backups.

```powershell
# Create Azure SQL Server
az sql server create `
  --name personal-finance-sql `
  --resource-group personal-finance-rg `
  --location eastus `
  --admin-user dbadmin `
  --admin-password YourPassword123!

# Create database
az sql db create `
  --resource-group personal-finance-rg `
  --server personal-finance-sql `
  --name PersonalFinance `
  --service-objective Basic
```

---

## 🔄 Continuous Deployment (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy-azure.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy Backend
      uses: azure/webapps-deploy@v2
      with:
        app-name: personal-finance-api-12345
        publish-profile: ${{ secrets.BACKEND_PUBLISH_PROFILE }}
        package: Backend/bin/Release/net8.0/publish
    
    - name: Deploy Frontend  
      uses: azure/webapps-deploy@v2
      with:
        app-name: personal-finance-web-12345
        publish-profile: ${{ secrets.FRONTEND_PUBLISH_PROFILE }}
        package: Frontend/dist
```

Get publish profiles from Azure Portal:
1. Go to Web App → Download publish profile
2. Add as GitHub secret
3. Push to main branch → auto-deploys

---

## 🐛 Troubleshooting

### "Authentication failed"
```powershell
az logout
az login  # Re-authenticate
```

### "Insufficient quota"
- Upgrade to paid subscription
- Check quotas: `az account get-access-token`

### "Web App returns 500 error"
```powershell
# Check logs
az webapp log tail --resource-group personal-finance-rg --name personal-finance-api-XXXXX

# Check if app is running
az webapp show --resource-group personal-finance-rg --name personal-finance-api-XXXXX --query state
```

### "Database connection failed"
- Verify connection string in app settings
- Check IP firewall rules (if using Azure SQL)
- Ensure database file permissions

### "Frontend cannot reach backend"
- Verify CORS is configured
- Check backend URL in frontend settings
- Ensure both apps are running: `az webapp restart ...`

---

## 📞 Getting Help

- **Azure Docs:** https://docs.microsoft.com/azure/
- **Azure CLI Reference:** https://docs.microsoft.com/cli/azure/
- **Troubleshooting:** https://docs.microsoft.com/azure/app-service/troubleshoot-common-app-service-errors
- **Community:** Stack Overflow tag `azure`

---

## 📋 Deployment Checklist

- [ ] Azure account created
- [ ] Azure CLI installed and verified
- [ ] Logged in to Azure (`az login`)
- [ ] Deployment script ran successfully
- [ ] Backend app is running
- [ ] Frontend app is running
- [ ] APIs are responding
- [ ] CORS configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backup strategy configured
- [ ] Custom domain configured (optional)
- [ ] Team members have access

---

## 🎉 You're Live!

Your Personal Finance Application is now deployed to Azure and accessible worldwide!

**Next Steps:**
1. Share the URLs with team members
2. Test all features
3. Set up custom domain (optional)
4. Configure backups
5. Monitor performance
6. Gather user feedback

---

**Status:** ✅ Ready for Azure Deployment  
**Last Updated:** March 9, 2026  
**Application:** Personal Finance v1.0
