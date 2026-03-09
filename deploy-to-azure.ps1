#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Personal Finance Application - Azure Deployment Script
.DESCRIPTION
    This script automates the deployment of the Personal Finance Application to Azure App Service
.EXAMPLE
    .\deploy-to-azure.ps1
.NOTES
    Prerequisites:
    - Azure CLI installed and in PATH
    - Azure subscription with available credits
    - Authenticated to Azure (az login)
#>

[CmdletBinding()]
param()

# Color output helper
function Write-Status {
    param([string]$Message, [ValidateSet('Info', 'Success', 'Warning', 'Error')]$Type = 'Info')
    
    $colors = @{
        'Info'    = 'Cyan'
        'Success' = 'Green'
        'Warning' = 'Yellow'
        'Error'   = 'Red'
    }
    
    $prefix = @{
        'Info'    = 'ℹ'
        'Success' = '✅'
        'Warning' = '⚠️'
        'Error'   = '❌'
    }
    
    Write-Host "$($prefix[$Type]) $Message" -ForegroundColor $colors[$Type]
}

# Verify Azure CLI
Write-Status "Checking Azure CLI installation..." -Type Info
try {
    $azVersion = az --version 2>&1 | Select-Object -First 1
    if (-not $azVersion) {
        Write-Status "Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -Type Error
        exit 1
    }
    Write-Status "Azure CLI found: $azVersion" -Type Success
} catch {
    Write-Status "Azure CLI verification failed: $_" -Type Error
    exit 1
}

# Verify logged in
Write-Status "Verifying Azure authentication..." -Type Info
try {
    $currentUser = az account show --query 'user.name' -o tsv 2>&1
    if (-not $currentUser -or $currentUser.Contains("not logged")) {
        Write-Status "Not logged in to Azure. Running 'az login'..." -Type Warning
        az login
    }
    Write-Status "Authenticated as: $currentUser" -Type Success
} catch {
    Write-Status "Authentication failed: $_" -Type Error
    exit 1
}

# Deployment configuration
$config = @{
    resourceGroup    = "personal-finance-rg"
    location         = "eastus"
    appServicePlan   = "personal-finance-plan"
    backendApp       = "personal-finance-api-$(Get-Random -Minimum 10000 -Maximum 99999)"
    frontendApp      = "personal-finance-web-$(Get-Random -Minimum 10000 -Maximum 99999)"
    sku              = "B1"
    jwtSecret        = "your-ultra-secure-secret-key-minimum-32-characters-long-$(Get-Random)"
}

Write-Status "Deployment Configuration:" -Type Info
$config.GetEnumerator() | ForEach-Object {
    Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Cyan
}

# Confirmation
$confirm = Read-Host "Continue with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Status "Deployment cancelled." -Type Warning
    exit 0
}

try {
    # Step 1: Create Resource Group
    Write-Status "Creating resource group: $($config.resourceGroup)..." -Type Info
    az group create `
        --name $config.resourceGroup `
        --location $config.location | Out-Null
    Write-Status "Resource group created" -Type Success

    # Step 2: Create App Service Plan
    Write-Status "Creating App Service Plan: $($config.appServicePlan)..." -Type Info
    az appservice plan create `
        --name $config.appServicePlan `
        --resource-group $config.resourceGroup `
        --sku $config.sku `
        --is-linux | Out-Null
    Write-Status "App Service Plan created" -Type Success

    # Step 3: Create Backend Web App
    Write-Status "Creating Backend Web App: $($config.backendApp)..." -Type Info
    az webapp create `
        --resource-group $config.resourceGroup `
        --plan $config.appServicePlan `
        --name $config.backendApp `
        --runtime "DOTNET:8.0" | Out-Null
    Write-Status "Backend Web App created" -Type Success

    # Step 4: Configure Backend Settings
    Write-Status "Configuring Backend settings..." -Type Info
    az webapp config appsettings set `
        --resource-group $config.resourceGroup `
        --name $config.backendApp `
        --settings `
            "ASPNETCORE_ENVIRONMENT=Production" `
            "Jwt__SecretKey=$($config.jwtSecret)" `
            "Jwt__Issuer=PersonalFinanceAPI" `
            "Jwt__Audience=PersonalFinanceClient" `
            "Jwt__ExpiryMinutes=10080" | Out-Null
    Write-Status "Backend settings configured" -Type Success

    # Step 5: Create Frontend Web App
    Write-Status "Creating Frontend Web App: $($config.frontendApp)..." -Type Info
    az webapp create `
        --resource-group $config.resourceGroup `
        --plan $config.appServicePlan `
        --name $config.frontendApp `
        --runtime "NODE:18-lts" | Out-Null
    Write-Status "Frontend Web App created" -Type Success

    # Step 6: Configure Frontend Settings
    Write-Status "Configuring Frontend settings..." -Type Info
    az webapp config appsettings set `
        --resource-group $config.resourceGroup `
        --name $config.frontendApp `
        --settings `
            "BACKEND_URL=https://$($config.backendApp).azurewebsites.net/api" | Out-Null
    Write-Status "Frontend settings configured" -Type Success

    # Step 7: Configure CORS
    Write-Status "Configuring CORS..." -Type Info
    az webapp cors add `
        --resource-group $config.resourceGroup `
        --name $config.backendApp `
        --allowed-origins "https://$($config.frontendApp).azurewebsites.net" | Out-Null
    Write-Status "CORS configured" -Type Success

    # Step 8: Enable Always On
    Write-Status "Configuring Always On..." -Type Info
    az webapp config set `
        --resource-group $config.resourceGroup `
        --name $config.backendApp `
        --always-on true | Out-Null
    Write-Status "Always On enabled" -Type Success

    Write-Status "Deployment completed successfully!" -Type Success
    Write-Host "`nAccess your application at:" -ForegroundColor Green
    Write-Host "  Frontend: https://$($config.frontendApp).azurewebsites.net" -ForegroundColor Cyan
    Write-Host "  Backend:  https://$($config.backendApp).azurewebsites.net" -ForegroundColor Cyan

    Write-Host "`nNext steps:" -ForegroundColor Green
    Write-Host "  1. Deploy code using Docker or Local Git"
    Write-Host "  2. Configure custom domain (optional)"
    Write-Host "  3. Setup SSL certificate"
    Write-Host "  4. Enable monitoring and backups"

} catch {
    Write-Status "Deployment failed: $_" -Type Error
    exit 1
}
