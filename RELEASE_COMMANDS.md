# Quick Release Commands - v2.1.1-beta

## All-in-One Release (Copy & Paste)

### Windows PowerShell

```powershell
# 1. Initialize git (if needed)
if (-not (Test-Path .git)) {
    git init
    git remote add origin https://github.com/thecrackofdan/QuaiMiner-CORE-OS.git
}

# 2. Stage and commit
git add -A
git commit -m "Release v2.1.1-beta: Competitive solo mining solution with insights and automatic pool switching"

# 3. Push to GitHub
git branch -M main
git push -u origin main

# 4. Create tag
git tag -a v2.1.1-beta -m "v2.1.1-beta release"
git push origin v2.1.1-beta

# 5. Create release (requires GitHub CLI)
.\AUTHENTICATE_AND_RELEASE.ps1
```

### Linux/Mac

```bash
# 1. Initialize git (if needed)
if [ ! -d .git ]; then
    git init
    git remote add origin https://github.com/thecrackofdan/QuaiMiner-CORE-OS.git
fi

# 2. Stage and commit
git add -A
git commit -m "Release v2.1.1-beta: Competitive solo mining solution with insights and automatic pool switching"

# 3. Push to GitHub
git branch -M main
git push -u origin main

# 4. Create tag
git tag -a v2.1.1-beta -m "v2.1.1-beta release"
git push origin v2.1.1-beta

# 5. Create release (requires GitHub CLI or token)
export GITHUB_TOKEN=your_token_here
./create-github-release.sh
```

## Manual Release (GitHub Website)

1. **Push code to GitHub**:
   ```bash
   git add -A
   git commit -m "Release v2.1.1-beta"
   git push origin main
   ```

2. **Create tag**:
   ```bash
   git tag -a v2.1.1-beta -m "v2.1.1-beta release"
   git push origin v2.1.1-beta
   ```

3. **Create release on GitHub**:
   - Go to: https://github.com/thecrackofdan/QuaiMiner-CORE-OS/releases/new
   - Select tag: `v2.1.1-beta`
   - Title: `QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution`
   - Description: Copy from `RELEASE_NOTES_v2.1.1.md`
   - Check "This is a pre-release"
   - Click "Publish release"

## Release Details

- **Tag**: `v2.1.1-beta`
- **Type**: Pre-release (Beta)
- **Status**: Testing Phase
- **Title**: "QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution"

## Notes

- All version numbers updated to 2.1.1-beta
- CHANGELOG.md includes v2.1.1-beta entry
- Release notes prepared
- Scripts updated for v2.1.1-beta
- Ready to push! 🚀

