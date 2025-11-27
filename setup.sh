#!/bin/bash

# Quai GPU Miner - One-Command Setup
# Automatically detects GPU, installs drivers, and sets up mining

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⚡ Quai GPU Miner - Automatic Setup${NC}"
echo "========================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run with sudo:${NC}"
    echo "   sudo ./setup.sh"
    exit 1
fi

# Step 1: Detect GPU
echo -e "${YELLOW}🔍 Step 1: Detecting GPU...${NC}"

GPU_VENDOR=""
GPU_MODEL=""
NVIDIA_COUNT=0
AMD_COUNT=0

# Check for NVIDIA
if command -v lspci &> /dev/null; then
    if lspci | grep -i "nvidia" > /dev/null; then
        NVIDIA_COUNT=$(lspci | grep -i "nvidia" | wc -l)
        GPU_VENDOR="nvidia"
        GPU_MODEL=$(lspci | grep -i "nvidia" | head -1 | cut -d: -f3 | xargs)
        echo -e "${GREEN}✅ Detected: $NVIDIA_COUNT NVIDIA GPU(s)${NC}"
        echo "   Model: $GPU_MODEL"
    fi
    
    # Check for AMD
    if lspci | grep -i "radeon\|amd\|ati" > /dev/null; then
        AMD_COUNT=$(lspci | grep -i "radeon\|amd\|ati" | wc -l)
        if [ -z "$GPU_VENDOR" ]; then
            GPU_VENDOR="amd"
            GPU_MODEL=$(lspci | grep -i "radeon\|amd\|ati" | head -1 | cut -d: -f3 | xargs)
        fi
        echo -e "${GREEN}✅ Detected: $AMD_COUNT AMD GPU(s)${NC}"
        echo "   Model: $GPU_MODEL"
    fi
fi

if [ -z "$GPU_VENDOR" ]; then
    echo -e "${RED}❌ No GPU detected!${NC}"
    echo "   Please ensure your GPU is properly connected."
    exit 1
fi

# Step 2: Install drivers
echo ""
echo -e "${YELLOW}🔧 Step 2: Installing drivers...${NC}"

if [ "$GPU_VENDOR" = "nvidia" ]; then
    if ! command -v nvidia-smi &> /dev/null; then
        echo "   Installing NVIDIA drivers..."
        apt-get update
        add-apt-repository -y ppa:graphics-drivers/ppa 2>/dev/null || true
        apt-get update
        
        # Get recommended driver
        RECOMMENDED=$(ubuntu-drivers devices 2>/dev/null | grep "recommended" | awk '{print $5}' | head -1)
        if [ -n "$RECOMMENDED" ]; then
            apt-get install -y "$RECOMMENDED"
        else
            apt-get install -y nvidia-driver-535 || apt-get install -y nvidia-driver-525
        fi
        echo -e "${GREEN}✅ NVIDIA drivers installed${NC}"
        echo -e "${YELLOW}   ⚠️  Reboot required: sudo reboot${NC}"
    else
        echo -e "${GREEN}✅ NVIDIA drivers already installed${NC}"
    fi
fi

if [ "$GPU_VENDOR" = "amd" ]; then
    if ! command -v clinfo &> /dev/null || ! clinfo 2>/dev/null | grep -q "AMD\|Mesa"; then
        echo "   Installing AMD drivers..."
        apt-get update
        
        # Detect Ubuntu version
        if [ -f /etc/os-release ]; then
            UBUNTU_VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
        else
            UBUNTU_VERSION="22.04"
        fi
        
        # Install Mesa OpenCL for Ubuntu 22.04+
        if [ "$(echo "$UBUNTU_VERSION >= 22.04" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
            apt-get install -y \
                mesa-opencl-icd \
                opencl-headers \
                ocl-icd-libopencl1 \
                clinfo
        else
            # For older Ubuntu, use AMDGPU Pro
            apt-get install -y \
                opencl-headers \
                ocl-icd-libopencl1 \
                clinfo
        fi
        echo -e "${GREEN}✅ AMD drivers installed${NC}"
    else
        echo -e "${GREEN}✅ AMD drivers already installed${NC}"
    fi
fi

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"
apt-get update
apt-get install -y \
    build-essential \
    git \
    cmake \
    curl \
    wget \
    jq \
    nodejs \
    npm

# Step 4: Install quai-gpu-miner
echo ""
echo -e "${YELLOW}⛏️  Step 4: Installing quai-gpu-miner...${NC}"

MINER_DIR="/opt/quai-gpu-miner"
if [ ! -d "$MINER_DIR" ]; then
    echo "   Cloning quai-gpu-miner repository..."
    git clone https://github.com/dominant-strategies/quai-gpu-miner.git "$MINER_DIR"
    cd "$MINER_DIR"
    
    echo "   Building miner..."
    mkdir -p build
    cd build
    cmake ..
    make -j$(nproc)
    
    echo -e "${GREEN}✅ quai-gpu-miner installed${NC}"
else
    echo -e "${GREEN}✅ quai-gpu-miner already installed${NC}"
fi

# Step 5: Setup simple web interface
echo ""
echo -e "${YELLOW}🌐 Step 5: Setting up web interface...${NC}"

if [ -d "miner-dashboard" ]; then
    cd miner-dashboard
    if [ ! -d "node_modules" ]; then
        echo "   Installing dashboard dependencies..."
        npm install
    fi
    echo -e "${GREEN}✅ Web interface ready${NC}"
else
    echo -e "${YELLOW}   ⚠️  Dashboard directory not found${NC}"
fi

# Step 6: Create systemd service
echo ""
echo -e "${YELLOW}⚙️  Step 6: Creating systemd service...${NC}"

cat > /etc/systemd/system/quai-gpu-miner.service << EOF
[Unit]
Description=Quai GPU Miner
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$MINER_DIR/build
ExecStart=$MINER_DIR/build/ethcoreminer -G
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo -e "${GREEN}✅ Systemd service created${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Summary:"
echo "   GPU: $GPU_VENDOR ($GPU_MODEL)"
echo "   Miner: $MINER_DIR"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Configure mining:"
echo "   cd miner-dashboard"
echo "   npm start"
echo "   # Open http://localhost:3000 in your browser"
echo ""
if [ "$GPU_VENDOR" = "nvidia" ] && ! command -v nvidia-smi &> /dev/null; then
    echo "2. Reboot to activate drivers:"
    echo "   sudo reboot"
    echo ""
fi
echo "3. Start mining:"
echo "   sudo systemctl start quai-gpu-miner"
echo "   sudo systemctl enable quai-gpu-miner"
echo ""
echo -e "${BLUE}Happy Mining! ⛏️${NC}"

