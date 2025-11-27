# GitHub Release Instructions - v2.1.1-beta

## Quick Release (Recommended)

### Using GitHub CLI (Easiest)

```powershell
# Windows PowerShell
.\AUTHENTICATE_AND_RELEASE.ps1
```

Or manually:
```powershell
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
```

### Using Scripts

**Windows:**
```powershell
.\setup-github-release.ps1
```

**Linux/Mac:**
```bash
chmod +x create-github-release.sh
export GITHUB_TOKEN=your_token_here
./create-github-release.sh
```

## Release Details

- **Tag**: `v2.1.1-beta`
- **Title**: "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution"
- **Type**: Pre-release (beta)
- **Status**: Testing Phase

## What's Included

### New Features
- Mining Insights & Analytics
- Enhanced Pool Manager with automatic switching
- Smart pool recommendations
- One-click pool connection
- Optimization suggestions

### Technical Improvements
- Fixed input validation bugs
- Enhanced error handling
- Consistent logging
- Better security
- Performance optimizations

## Before Releasing

1. ✅ All code changes committed
2. ✅ Version numbers updated to 2.1.1-beta
3. ✅ CHANGELOG.md updated
4. ✅ RELEASE_NOTES created
5. ✅ Testing documentation updated

## After Release

1. Verify release appears on GitHub
2. Check that tag is created
3. Verify release notes display correctly
4. Test download links (if any)

## Notes

- This is a **beta/pre-release** - marked as prerelease on GitHub
- Users will see "Pre-release" badge on GitHub
- Suitable for testing and feedback
- Not recommended for production use yet

