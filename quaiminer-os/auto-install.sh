#!/bin/bash

# Automated Installation Script
# Detects hardware, installs drivers, configures, and starts mining automatically

set -e

echo "🚀 QuaiMiner CORE OS - Automated Installation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Detect Hardware
echo "📦 Step 1: Detecting hardware..."
GPU_COUNT=0
GPU_VENDOR=""

if command -v nvidia-smi &> /dev/null; then
    GPU_COUNT=$(nvidia-smi -L | wc -l)
    GPU_VENDOR="nvidia"
    echo -e "${GREEN}✅ Detected ${GPU_COUNT} NVIDIA GPU(s)${NC}"
elif lspci | grep -i "radeon\|amd" &> /dev/null; then
    GPU_COUNT=$(lspci | grep -i "radeon\|amd" | wc -l)
    GPU_VENDOR="amd"
    echo -e "${GREEN}✅ Detected ${GPU_COUNT} AMD GPU(s)${NC}"
else
    echo -e "${YELLOW}⚠️  No GPUs detected. Please check hardware connections.${NC}"
    exit 1
fi

# Step 2: Install Drivers (if needed)
echo ""
echo "📦 Step 2: Checking drivers..."
if [ "$GPU_VENDOR" = "nvidia" ]; then
    if ! command -v nvidia-smi &> /dev/null; then
        echo -e "${YELLOW}⚠️  NVIDIA drivers not found. Installing...${NC}"
        # Install NVIDIA drivers (Ubuntu/Debian)
        sudo apt update
        sudo apt install -y nvidia-driver-535
    else
        echo -e "${GREEN}✅ NVIDIA drivers installed${NC}"
    fi
elif [ "$GPU_VENDOR" = "amd" ]; then
    if ! command -v rocm-smi &> /dev/null; then
        echo -e "${YELLOW}⚠️  AMD drivers not found. Installing...${NC}"
        # Install AMD drivers
        wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -
        echo 'deb [arch=amd64] https://repo.radeon.com/rocm/apt/5.7/ jammy main' | sudo tee /etc/apt/sources.list.d/rocm.list
        sudo apt update
        sudo apt install -y rocm-dkms
    else
        echo -e "${GREEN}✅ AMD drivers installed${NC}"
    fi
fi

# Step 3: Install Quai GPU Miner
echo ""
echo "📦 Step 3: Installing Quai GPU Miner..."
if [ ! -f "/opt/quaiminer/quai-gpu-miner/build/ethcoreminer" ]; then
    echo "Installing miner..."
    # Run installation script
    if [ -f "./install-unified.sh" ]; then
        sudo ./install-unified.sh
    else
        echo -e "${RED}❌ Installation script not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Quai GPU Miner already installed${NC}"
fi

# Step 4: Auto-Configure
echo ""
echo "📦 Step 4: Auto-configuring..."
CONFIG_DIR="/etc/quaiminer"
mkdir -p "$CONFIG_DIR"

# Generate optimal config based on hardware
if [ "$GPU_VENDOR" = "amd" ]; then
    POWER_LIMIT="-20"
    CORE_CLOCK="1545"
    MEMORY_CLOCK="2000"
    INTENSITY="20"
elif [ "$GPU_VENDOR" = "nvidia" ]; then
    POWER_LIMIT="70"
    CORE_CLOCK="0"
    MEMORY_CLOCK="1000"
    INTENSITY="24"
fi

# Determine mining mode
if [ -f "/etc/quaiminer/node-running" ] || systemctl is-active --quiet quai-node; then
    MINING_MODE="solo"
    STRATUM="stratum://localhost:3333"
    echo -e "${GREEN}✅ Quai node detected - configuring for solo mining${NC}"
else
    MINING_MODE="pool"
    STRATUM="stratum+tcp://pool.quai.network:3333"
    echo -e "${YELLOW}⚠️  No Quai node detected - configuring for pool mining${NC}"
fi

# Create config file
cat > "$CONFIG_DIR/config.json" << EOF
{
    "miner": {
        "stratum": "${STRATUM}",
        "wallet": "",
        "worker": "rig-$(hostname)",
        "miningMode": "${MINING_MODE}"
    },
    "node": {
        "rpcUrl": "http://localhost:8545",
        "requireSynced": true
    },
    "gpu": {
        "type": "${GPU_VENDOR}",
        "powerLimit": "${POWER_LIMIT}",
        "coreClock": "${CORE_CLOCK}",
        "memoryClock": "${MEMORY_CLOCK}",
        "intensity": "${INTENSITY}"
    },
    "autoStart": true,
    "autoRestart": true
}
EOF

echo -e "${GREEN}✅ Configuration created${NC}"

# Step 5: Enable Services
echo ""
echo "📦 Step 5: Enabling services..."
sudo systemctl enable quaiminer-miner
sudo systemctl enable quaiminer-dashboard

# Step 6: Start Mining
echo ""
echo "📦 Step 6: Starting mining..."
read -p "Enter your wallet address (or press Enter to skip): " WALLET_ADDRESS

if [ -n "$WALLET_ADDRESS" ]; then
    # Update config with wallet
    jq ".miner.wallet = \"${WALLET_ADDRESS}\"" "$CONFIG_DIR/config.json" > "$CONFIG_DIR/config.json.tmp"
    mv "$CONFIG_DIR/config.json.tmp" "$CONFIG_DIR/config.json"
fi

# Start miner
sudo systemctl start quaiminer-miner
sudo systemctl start quaiminer-dashboard

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Your mining rig is now configured and running!"
echo "Dashboard: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "To view status: sudo systemctl status quaiminer-miner"
echo "To view logs: sudo journalctl -u quaiminer-miner -f"

