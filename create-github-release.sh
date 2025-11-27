#!/bin/bash

# Script to create GitHub release using GitHub API
# Requires GITHUB_TOKEN environment variable

set -e

REPO="thecrackofdan/QuaiMiner-CORE-OS"
TAG="v2.1.1-beta"
TITLE="QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution"

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN environment variable not set"
    echo ""
    echo "To create a release, you need a GitHub Personal Access Token:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select scope: 'repo' (full control of private repositories)"
    echo "4. Copy the token"
    echo "5. Run: export GITHUB_TOKEN=your_token_here"
    echo "6. Then run this script again"
    exit 1
fi

# Read release notes
if [ -f "RELEASE_NOTES.md" ]; then
    RELEASE_NOTES=$(cat RELEASE_NOTES.md)
else
    RELEASE_NOTES="QuaiMiner CORE OS v2.1.1-beta - Competitive Solo Mining Solution

⚠️ BETA RELEASE - Testing Phase

Major Features:
- Mining Insights & Analytics (profitability, ROI, projections)
- Enhanced Pool Manager with automatic switching
- Smart pool recommendations
- One-click pool connection
- Optimization suggestions

See CHANGELOG.md for full details."
fi

# Create release using GitHub API
echo "📦 Creating GitHub release..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO/releases" \
  -d "{
    \"tag_name\": \"$TAG\",
    \"name\": \"$TITLE\",
    \"body\": $(echo "$RELEASE_NOTES" | jq -Rs .),
    \"draft\": false,
    \"prerelease\": true
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Release created successfully!"
    echo "🔗 View at: https://github.com/$REPO/releases/tag/$TAG"
else
    echo "❌ Failed to create release"
    echo "HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

