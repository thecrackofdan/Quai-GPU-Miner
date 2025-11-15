#!/bin/bash

# Quick AMD RX 590 OpenCL Setup for Ubuntu 20.04

set -e

echo "🚀 Quick AMD RX 590 OpenCL Setup for Ubuntu 20.04"
echo "================================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Don't run this script as root. Run as your regular user."
    exit 1
fi

# Step 1: Update system
echo "📦 Updating system packages..."
if ! sudo apt update; then
    echo "❌ Failed to update package lists"
    exit 1
fi
if ! sudo apt upgrade -y; then
    echo "⚠️  Some packages failed to upgrade, continuing anyway..."
fi

# Step 2: Install dependencies
echo "🔧 Installing dependencies..."
if ! sudo apt install -y build-essential dkms linux-headers-$(uname -r) wget gdebi-core software-properties-common clinfo mesa-utils; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 3: Check GPU detection
echo "🔍 Checking for RX 590..."
if ! command -v lspci &> /dev/null; then
    echo "⚠️  lspci not found, skipping GPU detection check"
else
    GPU_DETECTED=$(lspci | grep -i "Radeon.*RX.*590" | wc -l)
    if [ "$GPU_DETECTED" -eq 0 ]; then
        echo "⚠️  RX 590 not detected. Showing all AMD GPUs:"
        lspci | grep -i "Radeon\|AMD" || echo "No AMD GPUs found"
        echo ""
        echo "Please ensure your RX 590 is properly installed."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "✅ RX 590 detected!"
    fi
fi

# Step 4: Install AMDGPU Pro drivers
echo "🎯 Installing AMDGPU Pro drivers..."

# Create Downloads directory if it doesn't exist
mkdir -p ~/Downloads
cd ~/Downloads

# Download AMDGPU Pro (Ubuntu 20.04 version)
DRIVER_FILE="amdgpu-pro-22.40-2211043-ubuntu-20.04.tar.xz"
DRIVER_DIR="amdgpu-pro-22.40-2211043-ubuntu-20.04"

if [ ! -f "$DRIVER_FILE" ]; then
    echo "📥 Downloading AMDGPU Pro drivers (this may take a while)..."
    if ! wget https://drivers.amd.com/drivers/linux/$DRIVER_FILE; then
        echo "❌ Failed to download AMDGPU Pro drivers"
        echo "Please check your internet connection and try again"
        exit 1
    fi
fi

# Extract and install
if [ ! -d "$DRIVER_DIR" ]; then
    echo "📦 Extracting driver package..."
    if ! tar -Jxvf $DRIVER_FILE; then
        echo "❌ Failed to extract driver package"
        exit 1
    fi
fi

cd $DRIVER_DIR

if [ ! -f "./amdgpu-pro-install" ]; then
    echo "❌ Driver installer not found in extracted directory"
    exit 1
fi

echo "⚙️  Installing drivers (this may take a while)..."
if ! sudo ./amdgpu-pro-install --opencl=rocm,legacy --no-dkms; then
    echo "⚠️  Driver installation encountered issues"
    echo "You may need to try a different installation method"
    echo "See the troubleshooting guide for alternatives"
fi

# Step 5: Configure permissions
echo "🔐 Setting up user permissions..."
sudo usermod -a -G render,video $USER

# Create udev rules
sudo bash -c 'cat > /etc/udev/rules.d/99-amdgpu.rules << EOF
KERNEL=="card[0-9]*", GROUP="render", MODE="0660"
KERNEL=="renderD[0-9]*", GROUP="render", MODE="0660"
EOF'

sudo udevadm control --reload-rules
sudo udevadm trigger

# Step 6: Set environment variables
echo "🌍 Setting up environment variables..."
# Check if variables already exist to avoid duplicates
if ! grep -q "ROC_ENABLE_PRE_VEGA" ~/.bashrc; then
    echo 'export ROC_ENABLE_PRE_VEGA=1' >> ~/.bashrc
fi
if ! grep -q "HSA_OVERRIDE_GFX_VERSION" ~/.bashrc; then
    echo 'export HSA_OVERRIDE_GFX_VERSION=8.0.0' >> ~/.bashrc
fi
if ! grep -q "GPU_FORCE_64BIT_PTR" ~/.bashrc; then
    echo 'export GPU_FORCE_64BIT_PTR=1' >> ~/.bashrc
fi
if ! grep -q "GPU_MAX_HEAP_SIZE" ~/.bashrc; then
    echo 'export GPU_MAX_HEAP_SIZE=100' >> ~/.bashrc
fi
if ! grep -q "GPU_USE_SYNC_OBJECTS" ~/.bashrc; then
    echo 'export GPU_USE_SYNC_OBJECTS=1' >> ~/.bashrc
fi

# Step 7: Create verification script
echo "📋 Creating verification script..."
cat > ~/verify_amd_setup.sh << 'EOF'
#!/bin/bash
echo "=== AMD RX 590 Setup Verification ==="
echo "1. GPU Detection:"
lspci | grep -i "Radeon\|AMD"
echo ""
echo "2. OpenCL Platforms:"
clinfo | head -30
echo ""
echo "3. Driver Status:"
lsmod | grep amdgpu
echo ""
echo "4. GPU Device Permissions:"
ls -la /dev/dri/ | grep -E "(card|render)"
echo ""
echo "5. Current Groups:"
groups
EOF

chmod +x ~/verify_amd_setup.sh

echo ""
echo "✅ Installation complete!"
echo ""
echo "🔄 Please reboot your system now:"
echo "   sudo reboot"
echo ""
echo "🧪 After reboot, run verification:"
echo "   ~/verify_amd_setup.sh"
echo ""
echo "⚡ For Quai mining, use these environment variables:"
echo "   export ROC_ENABLE_PRE_VEGA=1"
echo "   export HSA_OVERRIDE_GFX_VERSION=8.0.0"
echo "   export GPU_FORCE_64BIT_PTR=1"
echo "   export GPU_MAX_HEAP_SIZE=100"
echo "   export GPU_USE_SYNC_OBJECTS=1"