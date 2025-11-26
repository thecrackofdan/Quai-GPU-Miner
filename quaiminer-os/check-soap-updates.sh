#!/bin/bash

# SOAP Merge Mining Update Checker
# Checks for updates on SOAP merge mining with Ravencoin

set -e

echo "🔍 Checking for SOAP Merge Mining Updates..."
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check quai-gpu-miner for SOAP updates
echo "📦 Checking quai-gpu-miner repository..."
QUAI_MINER_LATEST=$(curl -s https://api.github.com/repos/dominant-strategies/quai-gpu-miner/releases/latest 2>/dev/null || echo "")
if [ -n "$QUAI_MINER_LATEST" ]; then
    QUAI_VERSION=$(echo "$QUAI_MINER_LATEST" | grep -o '"tag_name":"[^"]*' | cut -d'"' -f4)
    QUAI_DATE=$(echo "$QUAI_MINER_LATEST" | grep -o '"published_at":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Latest Release: $QUAI_VERSION${NC}"
    echo "   Published: $QUAI_DATE"
    
    # Check for SOAP mentions
    if echo "$QUAI_MINER_LATEST" | grep -qi "soap\|merge"; then
        echo -e "${GREEN}🎉 SOAP/Merge mining mentioned in release!${NC}"
        echo "$QUAI_MINER_LATEST" | grep -i "soap\|merge" | head -5
    else
        echo -e "${YELLOW}⚠️  No SOAP/merge mining mentions in latest release${NC}"
    fi
else
    echo -e "${RED}❌ Could not fetch quai-gpu-miner releases${NC}"
fi

echo ""
echo "📦 Checking go-quai repository..."
GO_QUAI_LATEST=$(curl -s https://api.github.com/repos/dominant-strategies/go-quai/releases/latest 2>/dev/null || echo "")
if [ -n "$GO_QUAI_LATEST" ]; then
    GO_QUAI_VERSION=$(echo "$GO_QUAI_LATEST" | grep -o '"tag_name":"[^"]*' | cut -d'"' -f4)
    GO_QUAI_DATE=$(echo "$GO_QUAI_LATEST" | grep -o '"published_at":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Latest Release: $GO_QUAI_VERSION${NC}"
    echo "   Published: $GO_QUAI_DATE"
    
    # Check for SOAP mentions
    if echo "$GO_QUAI_LATEST" | grep -qi "soap\|merge"; then
        echo -e "${GREEN}🎉 SOAP/Merge mining mentioned in release!${NC}"
        echo "$GO_QUAI_LATEST" | grep -i "soap\|merge" | head -5
    else
        echo -e "${YELLOW}⚠️  No SOAP/merge mining mentions in latest release${NC}"
    fi
else
    echo -e "${RED}❌ Could not fetch go-quai releases${NC}"
fi

echo ""
echo "📝 Checking recent commits..."
echo "quai-gpu-miner recent commits (last 10):"
curl -s "https://api.github.com/repos/dominant-strategies/quai-gpu-miner/commits?per_page=10" | \
    grep -E '"message"|"date"' | \
    grep -i "soap\|merge" | head -5 || echo "   No SOAP/merge mentions in recent commits"

echo ""
echo "=========================================="
echo "💡 Tips:"
echo "   - Monitor Quai Network Discord: https://discord.gg/quai"
echo "   - Check docs.qu.ai for documentation updates"
echo "   - Review GitHub repositories for latest commits"
echo ""
echo "📅 Last checked: $(date)"

