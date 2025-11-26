# Easiest Way to Complete GitHub Setup

## 🎯 Option 1: GitHub CLI (Easiest - If Installed)

If you have GitHub CLI (`gh`) installed, this is the **easiest way**:

```bash
# Create release (one command!)
gh release create v2.0.0 \
  --title "QuaiMiner CORE OS v2.0.0 - Complete Mining OS Release" \
  --notes-file RELEASE_NOTES.md

# Update description (one command!)
gh repo edit --description "Complete mining operating system for Quai Network. Multi-GPU, multi-rig support with automatic detection, driver management, and GPU optimization. Supports all ProgPoW-capable GPUs (AMD & NVIDIA)."

# Add topics
gh repo edit --add-topic quai-network --add-topic mining --add-topic gpu-mining --add-topic progpow --add-topic quaiminer-core-os --add-topic solo-mining
```

**That's it!** Just 3 commands and you're done.

## 🔑 Option 2: GitHub Token (Quick Setup)

If you don't have GitHub CLI, here's the **quickest token setup**:

### Step 1: Get Token (1 minute)

1. Open: https://github.com/settings/tokens/new
2. Name: `QuaiMiner Release` (or anything)
3. Expiration: `90 days` (or `No expiration`)
4. Check: ✅ **`repo`** (Full control of private repositories)
5. Click: **"Generate token"**
6. **Copy the token** (starts with `ghp_...`)

### Step 2: Run Scripts (30 seconds)

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="your_token_here"
bash create-github-release.sh
bash update-repo-description.sh
```

**Linux/Mac/Git Bash:**
```bash
export GITHUB_TOKEN=your_token_here
bash create-github-release.sh
bash update-repo-description.sh
```

## 🚀 Option 3: One-Line Commands (If You Have Token)

If you already have a token, you can run these directly:

```bash
# Set token (replace with your actual token)
export GITHUB_TOKEN=ghp_your_token_here

# Create release
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/thecrackofdan/QuaiMiner-CORE-OS/releases \
  -d '{"tag_name":"v2.0.0","name":"QuaiMiner CORE OS v2.0.0","body":"See RELEASE_NOTES.md","draft":false,"prerelease":false}'

# Update description
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/thecrackofdan/QuaiMiner-CORE-OS \
  -d '{"description":"Complete mining operating system for Quai Network. Multi-GPU, multi-rig support with automatic detection, driver management, and GPU optimization. Supports all ProgPoW-capable GPUs (AMD & NVIDIA)."}'
```

## 📋 Quick Comparison

| Method | Time | Difficulty | Requires |
|--------|------|------------|----------|
| GitHub CLI | 30 sec | ⭐ Easiest | `gh` installed |
| Token + Scripts | 2 min | ⭐⭐ Easy | GitHub token |
| Manual Browser | 3 min | ⭐⭐⭐ Medium | Nothing |

## 🎯 Recommendation

**Try GitHub CLI first** - it's the easiest if you have it installed!

If not, the token approach is still very quick (2 minutes total).

---

**Need help?** Let me know which method you'd like to use and I'll guide you through it!

