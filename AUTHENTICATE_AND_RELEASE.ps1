# Complete setup and release script
# Authenticates GitHub CLI (one-time) and creates release

Write-Host "🚀 QuaiMiner CORE OS - Complete Setup & Release" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Gray
Write-Host ""

# Refresh PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not found. Installing..." -ForegroundColor Red
    winget install --id GitHub.cli --accept-package-agreements --accept-source-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Start-Sleep -Seconds 2
}

# Check authentication
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
gh auth status 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not authenticated. Starting authentication..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Follow these steps:" -ForegroundColor Cyan
    Write-Host "   1. Browser will open" -ForegroundColor White
    Write-Host "   2. Authorize GitHub CLI" -ForegroundColor White
    Write-Host "   3. Return here when done" -ForegroundColor White
    Write-Host ""
    
    gh auth login --web
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Authentication failed. Please run 'gh auth login' manually." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
} else {
    Write-Host "✅ Already authenticated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Creating release..." -ForegroundColor Yellow

# Create release
gh release create v2.1.1-beta `
    --title "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution" `
    --notes "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution

⚠️ BETA RELEASE - Testing Phase

Major Features:
- Mining Insights & Analytics (profitability, ROI, projections)
- Enhanced Pool Manager with automatic switching
- Smart pool recommendations
- One-click pool connection
- Optimization suggestions

See CHANGELOG.md for full details." `
    --prerelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Release created!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Release creation failed. It may already exist." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Updating repository description..." -ForegroundColor Yellow

gh repo edit --description "Complete mining operating system for Quai Network. Multi-GPU, multi-rig support with automatic detection, driver management, and GPU optimization. Supports all ProgPoW-capable GPUs (AMD & NVIDIA)."

Write-Host ""
Write-Host "🏷️  Adding topics..." -ForegroundColor Yellow

gh repo edit --add-topic quai-network --add-topic mining --add-topic gpu-mining --add-topic progpow --add-topic quaiminer-core-os --add-topic solo-mining

Write-Host ""
Write-Host "✅ All done! Release created and repository updated." -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Future releases: Just run 'gh release create vX.Y.Z --title \"Title\" --notes-file RELEASE_NOTES.md'" -ForegroundColor Cyan

