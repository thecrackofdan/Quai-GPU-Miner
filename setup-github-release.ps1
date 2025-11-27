# PowerShell script to set up GitHub release (Windows)
# Easiest method for Windows users

Write-Host "🚀 QuaiMiner CORE OS - GitHub Release Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Gray
Write-Host ""

# Check for GitHub CLI
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "✅ GitHub CLI found! Using easiest method..." -ForegroundColor Green
    Write-Host ""
    
    # Create release
    Write-Host "📦 Creating release..." -ForegroundColor Yellow
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
    
    # Update description
    Write-Host "📝 Updating repository description..." -ForegroundColor Yellow
    gh repo edit --description "Complete mining operating system for Quai Network. Multi-GPU, multi-rig support with automatic detection, driver management, and GPU optimization. Supports all ProgPoW-capable GPUs (AMD & NVIDIA)."
    
    # Add topics
    Write-Host "🏷️  Adding topics..." -ForegroundColor Yellow
    gh repo edit --add-topic quai-network --add-topic mining --add-topic gpu-mining --add-topic progpow --add-topic quaiminer-core-os --add-topic solo-mining
    
    Write-Host ""
    Write-Host "✅ Done! Release created and repository updated." -ForegroundColor Green
    exit 0
}

# Fallback to token method
Write-Host "⚠️  GitHub CLI not found. Using token method..." -ForegroundColor Yellow
Write-Host ""

# Check for existing token
if ($env:GITHUB_TOKEN) {
    Write-Host "✅ GITHUB_TOKEN found in environment" -ForegroundColor Green
    $token = $env:GITHUB_TOKEN
} else {
    Write-Host "🔑 GitHub Token Required" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get a token: https://github.com/settings/tokens/new" -ForegroundColor Cyan
    Write-Host "1. Name: QuaiMiner Release" -ForegroundColor White
    Write-Host "2. Check: repo (Full control)" -ForegroundColor White
    Write-Host "3. Generate and copy token" -ForegroundColor White
    Write-Host ""
    $token = Read-Host "Paste your token here"
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host "❌ Token required. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Set token
$env:GITHUB_TOKEN = $token

Write-Host ""
Write-Host "📦 Creating release..." -ForegroundColor Yellow

# Create release
$releaseBody = Get-Content RELEASE_NOTES.md -Raw | ConvertTo-Json
    $releaseData = @{
    tag_name = "v2.1.1-beta"
    name = "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution"
    body = "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution

⚠️ BETA RELEASE - Testing Phase

Major Features:
- Mining Insights & Analytics (profitability, ROI, projections)
- Enhanced Pool Manager with automatic switching
- Smart pool recommendations
- One-click pool connection
- Optimization suggestions

See CHANGELOG.md for full details."
    draft = $false
    prerelease = $true
} | ConvertTo-Json

$headers = @{
    Authorization = "token $token"
    Accept = "application/vnd.github.v3+json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/thecrackofdan/QuaiMiner-CORE-OS/releases" `
        -Method Post -Headers $headers -Body $releaseData -ContentType "application/json"
    
    Write-Host "✅ Release created!" -ForegroundColor Green
    Write-Host "🔗 $($response.html_url)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to create release: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update description
Write-Host "📝 Updating repository description..." -ForegroundColor Yellow

    $repoData = @{
    description = "The best solo mining OS for Quai Network. Mining Insights, Automatic Pool Switching, Smart Recommendations. Free, open source, competitive with HiveOS/Minerstat."
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/thecrackofdan/QuaiMiner-CORE-OS" `
        -Method Patch -Headers $headers -Body $repoData -ContentType "application/json"
    
    Write-Host "✅ Description updated!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to update description: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green

