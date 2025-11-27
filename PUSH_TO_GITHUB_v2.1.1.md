# Push to GitHub - v2.1.1-beta Release

## Step 1: Initialize Git Repository (if not already done)

```bash
# Initialize git repository
git init

# Add remote (replace with your actual repo URL)
git remote add origin https://github.com/thecrackofdan/QuaiMiner-CORE-OS.git

# Or if using SSH
# git remote add origin git@github.com:thecrackofdan/QuaiMiner-CORE-OS.git
```

## Step 2: Stage All Changes

```bash
# Add all files
git add -A

# Check what will be committed
git status
```

## Step 3: Commit Changes

```bash
git commit -m "Release v2.1.1-beta: Competitive solo mining solution with insights and automatic pool switching

- Added Mining Insights & Analytics (profitability, ROI, projections)
- Enhanced Pool Manager with automatic switching
- Smart pool recommendations
- One-click pool connection
- Optimization suggestions
- Fixed input validation bugs
- Enhanced error handling and logging
- Performance optimizations"
```

## Step 4: Push to GitHub

```bash
# Push to main branch (or your default branch)
git branch -M main
git push -u origin main

# If branch already exists
git push origin main
```

## Step 5: Create Release Tag

### Option A: Using GitHub CLI (Easiest)

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

### Option B: Using Git Tags

```bash
# Create and push tag
git tag -a v2.1.1-beta -m "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution"
git push origin v2.1.1-beta

# Then create release on GitHub website or using API
```

### Option C: Using GitHub Website

1. Go to: https://github.com/thecrackofdan/QuaiMiner-CORE-OS/releases/new
2. Select tag: `v2.1.1-beta` (create if needed)
3. Title: `QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution`
4. Description: Copy from `RELEASE_NOTES_v2.1.1.md`
5. Check "This is a pre-release"
6. Click "Publish release"

## Step 6: Verify Release

1. Check release page: https://github.com/thecrackofdan/QuaiMiner-CORE-OS/releases
2. Verify tag `v2.1.1-beta` exists
3. Verify release notes display correctly
4. Verify "Pre-release" badge is shown

## Quick Command Summary

```bash
# Full workflow (if starting fresh)
git init
git remote add origin https://github.com/thecrackofdan/QuaiMiner-CORE-OS.git
git add -A
git commit -m "Release v2.1.1-beta: Competitive solo mining solution"
git branch -M main
git push -u origin main
git tag -a v2.1.1-beta -m "v2.1.1-beta release"
git push origin v2.1.1-beta

# Then create release using GitHub CLI or website
```

## Release Notes Template

The release notes are in `RELEASE_NOTES_v2.1.1.md`. Key points:

- ⚠️ BETA RELEASE - Testing Phase
- Major Features: Insights, Pool Manager, Auto-switching
- Competitive Advantages
- Installation instructions
- Testing status

## Troubleshooting

### "fatal: not a git repository"
- Run `git init` first

### "remote origin already exists"
- Use `git remote set-url origin <new-url>` to update

### "tag already exists"
- Delete local tag: `git tag -d v2.1.1-beta`
- Delete remote tag: `git push origin :refs/tags/v2.1.1-beta`
- Then create new tag

### GitHub CLI not authenticated
- Run `gh auth login` first
- Or use GitHub website to create release

## Files Updated for v2.1.1-beta

- ✅ README.md - Version updated to 2.1.1-beta
- ✅ TESTING_STATUS.md - Version updated
- ✅ CHANGELOG.md - Added v2.1.1-beta entry
- ✅ create-github-release.sh - Updated for v2.1.1-beta
- ✅ setup-github-release.ps1 - Updated for v2.1.1-beta
- ✅ AUTHENTICATE_AND_RELEASE.ps1 - Updated for v2.1.1-beta
- ✅ RELEASE_NOTES_v2.1.1.md - Created

All ready for release! 🚀

