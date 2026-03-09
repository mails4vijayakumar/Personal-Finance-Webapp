# Personal Finance Application - Azure Deployment Guide

## Prerequisites

Before deploying to Azure, ensure you have:

1. **Azure Subscription** - Active Azure account with credits
2. **Azure CLI** - Download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
3. **Docker** - (Optional, for containerized deployment)
4. **Git** - Version control (already installed)
5. **GitHub Account** - Repository access

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│         Azure App Service Plan (Web + API)          │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │  Frontend Web App    │  │  Backend API App     │ │
│  │ (React + Nginx)      │  │ (ASP.NET Core 8)     │ │
│  │ :443/80              │  │ :443/80              │ │
│  └──────────────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
         │                         │
         └────────────────────────┴─────────────────┐
                                                   │
┌──────────────────────────────────────────────────────┐
│      Azure SQL Database / SQLite Blob Storage        │
└──────────────────────────────────────────────────────┘
         │
         ├─ Application Insights (Performance Monitoring)
         ├─ Key Vault (Secrets Management)
         └─ Storage Account (Backups)
```

---

## Step-by-Step Deployment

### Phase 1: Prepare Your Environment

#### 1.1 Login to Azure

```bash
az login
```

This opens a browser window for authentication. Login with your Azure credentials.

#### 1.2 Set Default Subscription

```bash
# List available subscriptions
az account list --output table

# Set default subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID_OR_NAME"
```

#### 1.3 Create Azure Resource Group

A resource group is a logical container for all your Azure resources.

```bash
# Variables (customize as needed)
$resourceGroup = "personal-finance-rg"
$location = "eastus"  # Change to your preferred location

# Create resource group
az group create --name $resourceGroup --location $location

# Verify creation
az group list --output table
```

**Available Locations:**
- eastus, eastus2, westus, westus2
- westeurope, northeurope
- southeastasia, eastasia
- canadacentral, australiaeast

---

### Phase 2: Deploy Backend API

#### 2.1 Create App Service Plan

```bash
$appServicePlan = "personal-finance-plan"
$sku = "B1"  # B1=Shared, B2=Standard, S1=Advanced

# Create App Service Plan
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku $sku `
  --is-linux

# Verify creation
az appservice plan list --resource-group $resourceGroup --output table
```

**SKU Options:**
- **B1** (Recommended for Dev/Test): 1 GB RAM, 1 Core
- **B2**: 3.5 GB RAM, 2 Cores
- **S1**: 1.75 GB RAM, 1 Core, Auto-scaling capable
- **B3**: 7 GB RAM, 4 Cores

#### 2.2 Create Backend Web App

```bash
$backendAppName = "personal-finance-api-${randomId}"  # Must be globally unique
$runtimeStack = "DOTNETCORE:8.0"

# Create backend app
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $backendAppName `
  --runtime "$runtimeStack|8.0" `
  --runtime-version "8.0"

echo "Backend API URL: https://$backendAppName.azurewebsites.net"
```

#### 2.3 Configure Backend Environment Variables

```bash
# Create settings for backend app
$settings = @(
    "ASPNETCORE_ENVIRONMENT=Production",
    "ConnectionStrings__DefaultConnection=Data Source=/home/site/wwwroot/data/PersonalFinance.db;Pooling=true;Max Pool Size=20;",
    "Jwt__SecretKey=your-ultra-secure-secret-key-minimum-32-characters-long-here",
    "Jwt__Issuer=PersonalFinanceAPI",
    "Jwt__Audience=PersonalFinanceClient",
    "Jwt__ExpiryMinutes=10080",
    "WEBSITE_RUN_FROM_PACKAGE=1",
    "SCM_REPOSITORY_PATH=/home/site/repository",
    "DEPLOYMENT_BRANCH=main"
)

# Apply settings
foreach ($setting in $settings) {
    az webapp config appsettings set `
      --resource-group $resourceGroup `
      --name $backendAppName `
      --settings $setting
}

# Verify settings
az webapp config appsettings list --resource-group $resourceGroup --name $backendAppName --output table
```

#### 2.4 Enable Continuous Deployment from GitHub

```bash
# Get deployment credentials
$deploymentCreds = az webapp deployment source config --name $backendAppName `
  --resource-group $resourceGroup --query "xmlFullCredentials" -o tsv

# Configure GitHub repo
az webapp deployment source config-zip `
  --resource-group $resourceGroup `
  --name $backendAppName

# Or use GitHub Actions (see CI/CD section below)
```

#### 2.5 Deploy Backend Code

**Option A: Using Azure DevOps/GitHub Actions (Recommended)**

```bash
# Enable GitHub deployment
az webapp deployment source config `
  --name $backendAppName `
  --resource-group $resourceGroup `
  --repo-url "https://github.com/YOUR_USERNAME/Personal-Finance-Webapp" `
  --branch main `
  --git-token YOUR_GITHUB_TOKEN
```

**Option B: Manual Deployment**

```bash
cd Backend

# Publish to local folder
dotnet publish -c Release -o ./publish

# Create zip file
Compress-Archive -Path ./publish/* -DestinationPath backend.zip

# Deploy zip file
az webapp deployment source config-zip `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --src-path backend.zip

# Clean up
Remove-Item backend.zip
```

#### 2.6 Verify Backend Deployment

```bash
# Get backend URL
$backendUrl = "https://$backendAppName.azurewebsites.net"

# Test health endpoint
Invoke-RestMethod -Uri "$backendUrl/health" -Method Get

# Should return 200 OK and "Healthy"
```

---

### Phase 3: Deploy Frontend Web App

#### 3.1 Create Frontend Web App

```bash
$frontendAppName = "personal-finance-web-${randomId}"  # Must be globally unique
$runtimeStack = "node|18"

# Create frontend app
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $frontendAppName `
  --runtime "$runtimeStack"

echo "Frontend URL: https://$frontendAppName.azurewebsites.net"
```

#### 3.2 Configure Frontend Environment Variables

```bash
# Create environment settings for frontend
$settings = @(
    "VITE_API_URL=https://$backendAppName.azurewebsites.net",
    "VITE_APP_NAME=Personal Finance Tracker",
    "NODE_ENV=production",
    "SCM_REPOSITORY_PATH=/home/site/repository",
    "DEPLOYMENT_BRANCH=main"
)

# Apply settings
foreach ($setting in $settings) {
    az webapp config appsettings set `
      --resource-group $resourceGroup `
      --name $frontendAppName `
      --settings $setting
}
```

#### 3.3 Deploy Frontend Code

**Option A: Automated Deployment**

```bash
cd Frontend

# Build and prepare
npm run build

# Create deployment package
$deployPackage = @{
    Index = @"
<!DOCTYPE html>
<html>
<body>
  <script>
    document.location='/dist/index.html'
  </script>
</body>
</html>
"@
}

# Copy dist folder to deployment
Copy-Item -Path dist -Destination .deploy -Recurse -Force
Compress-Archive -Path .deploy/* -DestinationPath frontend.zip

# Deploy
az webapp deployment source config-zip `
  --resource-group $resourceGroup `
  --name $frontendAppName `
  --src-path frontend.zip
```

**Option B: GitHub Deployment**

```bash
# Enable continuous deployment from GitHub
az webapp deployment source config `
  --name $frontendAppName `
  --resource-group $resourceGroup `
  --repo-url "https://github.com/YOUR_USERNAME/Personal-Finance-Webapp" `
  --branch main `
  --git-token YOUR_GITHUB_TOKEN
```

#### 3.4 Configure CORS on Backend

```bash
# Allow frontend to call backend API
az webapp cors add `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --allowed-origins "https://$frontendAppName.azurewebsites.net" `
  --allowed-methods GET POST PUT DELETE `
  --allowed-headers "Content-Type,Authorization"

# Verify CORS
az webapp cors show --resource-group $resourceGroup --name $backendAppName
```

---

### Phase 4: Setup Database and Storage

#### 4.1 Create Storage Account for Database Backups

```bash
$storageAccountName = "financebackup$(Get-Random 10000)"

# Create storage account
az storage account create `
  --resource-group $resourceGroup `
  --name $storageAccountName `
  --location $location `
  --sku Standard_LRS

# Get connection string
$storageConnection = az storage account show-connection-string `
  --resource-group $resourceGroup `
  --name $storageAccountName `
  --query connectionString -o tsv

echo "Storage Connection: $storageConnection"
```

#### 4.2 Create Azure SQL Database (Optional - for production)

```bash
$sqlServerName = "personalfinance-${randomId}"
$sqlDbName = "finance_db"
$sqlAdminLogin = "sqladmin"
$sqlAdminPassword = "P@ssw0rd1234!"  # Change to strong password

# Create SQL Server
az sql server create `
  --resource-group $resourceGroup `
  --name $sqlServerName `
  --location $location `
  --admin-user $sqlAdminLogin `
  --admin-password $sqlAdminPassword

# Create database
az sql db create `
  --resource-group $resourceGroup `
  --server $sqlServerName `
  --name $sqlDbName `
  --edition Basic `
  --compute-model Serverless

# Get connection string
$sqlConnection = "Server=tcp:$sqlServerName.database.windows.net,1433;Initial Catalog=$sqlDbName;Persist Security Info=False;User ID=$sqlAdminLogin;Password=$sqlAdminPassword;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
```

---

### Phase 5: Setup SSL Certificate (HTTPS)

#### 5.1 Add Custom Domain (Optional but Recommended)

```bash
$customDomain = "yourfinance.com"

# Verify CNAME records are configured (your DNS provider)
# Add CNAME: finance -> personlfinance-web-123.azurewebsites.net

# Bind custom domain
az webapp config hostname add `
  --resource-group $resourceGroup `
  --webapp-name $frontendAppName `
  --hostname $customDomain
```

#### 5.2 Create SSL Certificate

```bash
# Option A: Use free Let's Encrypt via Azure App Service
# (Automatic renewal, recommended)

# Option B: Upload existing certificate
$certPath = "C:\path\to\certificate.pfx"
$certPassword = "your-cert-password"

az webapp config ssl upload `
  --resource-group $resourceGroup `
  --name $frontendAppName `
  --certificate-file $certPath `
  --certificate-password $certPassword
```

#### 5.3 Enable HTTPS Redirect

```bash
# Enable HTTPS only
az webapp update `
  --resource-group $resourceGroup `
  --name $frontendAppName `
  --https-only true

az webapp update `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --https-only true
```

---

### Phase 6: Setup Monitoring & Diagnostics

#### 6.1 Enable Application Insights

```bash
$appInsightsName = "personal-finance-insights"

# Create Application Insights
az monitor app-insights component create `
  --app $appInsightsName `
  --location $location `
  --resource-group $resourceGroup

# Get instrumentation key
$instrumentationKey = az monitor app-insights component show `
  --app $appInsightsName `
  --resource-group $resourceGroup `
  --query instrumentationKey -o tsv

# Add to backend settings
az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --settings "APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey"
```

#### 6.2 Enable Logging

```bash
# Enable app service logs
az webapp log config `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --docker-container-logging filesystem `
  --level information

az webapp log config `
  --resource-group $resourceGroup `
  --name $frontendAppName `
  --docker-container-logging filesystem `
  --level information

# View logs
az webapp log tail --resource-group $resourceGroup --name $backendAppName
```

---

### Phase 7: Test and Validate Deployment

#### 7.1 Test Backend API

```bash
$backendUrl = "https://$backendAppName.azurewebsites.net"

# Health check
Invoke-RestMethod -Uri "$backendUrl/health" -Method Get

# List transactions (should return 401 without auth token)
Invoke-RestMethod -Uri "$backendUrl/api/transactions" -Method Get

# Test with health endpoint
curl -X GET "$backendUrl/health"
```

#### 7.2 Test Frontend Application

Open browser and navigate to:
- https://yourfrontendappname.azurewebsites.net

**Verify:**
- Page loads without errors
- Can navigate between sections
- Charts render correctly
- Can login (if you have test account)

#### 7.3 Test Integration

```bash
# Test that frontend can reach backend
# (Check browser console for API errors)
# Network tab should show successful API calls
```

---

### Phase 8: Setup Backup & Disaster Recovery

#### 8.1 Create Backup of Database

```bash
# Backup Azure SQL Database
az sql db copy `
  --resource-group $resourceGroup `
  --server $sqlServerName `
  --name $sqlDbName `
  --dest-server $sqlServerName `
  --dest-name "${sqlDbName}_backup_$(Get-Date -Format yyyyMMdd)"

# Or download SQLite database if using local database
az webapp file upload `
  --resource-group $resourceGroup `
  --name $backendAppName `
  --src-path data/PersonalFinance.db `
  --dest-path /home/site/backups/
```

#### 8.2 Setup Auto-Backup

```bash
# Create backup schedule (for App Service)
# Unfortunately Azure doesn't have built-in scheduled backups for App Service
# Use Azure Automation or Functions to schedule backups
```

---

### Phase 9: Cost Optimization

#### 9.1 Enable Auto-Scale

```bash
$autoScaleRuleName = "finance-autoscale"

az monitor autoscale create `
  --resource-group $resourceGroup `
  --resource-type "Microsoft.Web/serverfarms" `
  --resource-name $appServicePlan `
  --min-count 1 `
  --max-count 3 `
  --count 1 `
  --name $autoScaleRuleName

# Set scaling rules
az monitor autoscale rule create `
  --resource-group $resourceGroup `
  --autoscale-name $autoScaleRuleName `
  --condition "Percentage CPU > 70 avg 5m 2" `
  --scale out 1

az monitor autoscale rule create `
  --resource-group $resourceGroup `
  --autoscale-name $autoScaleRuleName `
  --condition "Percentage CPU < 25 avg 5m 2" `
  --scale in 1
```

#### 9.2 Review and Optimize Costs

```bash
# View resource costs
az consumption usage list --format table

# Get cost recommendations
az advisor recommendation list --category Cost
```

---

## Post-Deployment Steps

### 10.1 Configure DNS

For custom domain:
```
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add DNS CNAME record:
   - Name: finance
   - Value: personlfinance-web-123.azurewebsites.net
3. Wait 24-48 hours for DNS propagation
```

### 10.2 Setup CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
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
      run: |
        az webapp up -g personal-finance-rg -n personal-finance-api
    
    - name: Deploy Frontend
      run: |
        cd Frontend
        npm install
        npm run build
        az webapp up -g personal-finance-rg -n personal-finance-web --src-path dist
```

### 10.3 Configure Monitoring Alerts

```bash
# Create alert for high CPU usage
az monitor metrics alert create `
  --name "finance-high-cpu" `
  --resource-group $resourceGroup `
  --scopes "/subscriptions/{subscription}/resourceGroups/$resourceGroup/providers/Microsoft.Web/sites/$backendAppName" `
  --condition "avg Percentage CPU > 80" `
  --window-size 5m `
  --evaluation-frequency 1m `
  --action email youremail@gmail.com
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized on API | Check JWT secret key configuration |
| CORS errors in browser | Verify CORS settings on backend |
| 404 on frontend routes | Check nginx.conf routing configuration |
| Slow performance | Scale up App Service plan or enable CDN |
| Database connection failed | Verify connection string in app settings |

### View Logs

```bash
# Stream logs in real-time
az webapp log tail --resource-group $resourceGroup --name $backendAppName

# Download logs
az webapp log download --resource-group $resourceGroup --name $backendAppName
```

---

## Success Criteria

After deployment, verify:

✅ Backend API is accessible at `https://yourapiname.azurewebsites.net/health`
✅ Frontend loads at `https://yourfrontendname.azurewebsites.net`
✅ Frontend can communicate with backend
✅ All features work (login, create transaction, view reports)
✅ HTTPS is enabled on both apps
✅ Monitoring and alerts are configured
✅ Backups are in place

---

## Cleanup (Delete All Resources)

```bash
# ⚠️ WARNING: This deletes everything!
az group delete --name $resourceGroup --yes --no-wait
```

---

## Support & Resources

- Azure Documentation: https://docs.microsoft.com/en-us/azure/
- Azure CLI Reference: https://docs.microsoft.com/en-us/cli/azure/
- Application Insights: https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview
- Pricing Calculator: https://azure.microsoft.com/en-us/pricing/calculator/

