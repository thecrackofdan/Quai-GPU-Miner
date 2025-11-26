#!/bin/bash

# Quick AMD RX 590 OpenCL Setup for Ubuntu (20.04, 22.04, 24.04+)
# Automatically detects Ubuntu version and installs appropriate drivers

set -e

# Detect Ubuntu version
detect_ubuntu_version() {
    if command -v lsb_release &> /dev/null; then
        UBUNTU_VERSION=$(lsb_release -rs)
        UBUNTU_CODENAME=$(lsb_release -cs)
    elif [ -f /etc/os-release ]; then
        UBUNTU_VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
        UBUNTU_CODENAME=$(grep VERSION_CODENAME /etc/os-release | cut -d'=' -f2)
    else
        echo "⚠️  Could not detect Ubuntu version, assuming 22.04"
        UBUNTU_VERSION="22.04"
        UBUNTU_CODENAME="jammy"
    fi
    echo "📋 Detected Ubuntu: $UBUNTU_VERSION ($UBUNTU_CODENAME)"
}

detect_ubuntu_version

echo "🚀 Quick AMD RX 590 OpenCL Setup for Ubuntu $UBUNTU_VERSION"
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

# Step 4: Install AMD drivers
echo "🎯 Installing AMD drivers..."

# Determine driver installation method based on Ubuntu version
if [ "$(echo "$UBUNTU_VERSION >= 22.04" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
    # Ubuntu 22.04+ - Use Mesa drivers (recommended) or AMDGPU Pro
    echo "💡 Ubuntu 22.04+ detected - Using Mesa drivers (recommended)"
    echo ""
    read -p "Install Mesa drivers (easier) or AMDGPU Pro (better performance)? (m/a): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Mm]$ ]] || [ -z "$REPLY" ]; then
        INSTALL_METHOD="mesa"
    else
        INSTALL_METHOD="amdgpu-pro"
    fi
else
    # Ubuntu 20.04 - Use AMDGPU Pro
    INSTALL_METHOD="amdgpu-pro"
fi

if [ "$INSTALL_METHOD" = "mesa" ]; then
    echo "📦 Installing Mesa OpenCL drivers..."
    sudo apt install -y mesa-opencl-icd opencl-headers opencl-clhpp-dev
    echo "✅ Mesa drivers installed"
else
    # Install AMDGPU Pro drivers
    echo "📦 Installing AMDGPU Pro drivers..."
    
    # Create Downloads directory if it doesn't exist
    mkdir -p ~/Downloads
    cd ~/Downloads
    
    # Select appropriate driver version based on Ubuntu version
    case "$UBUNTU_CODENAME" in
        focal|20.04)
            DRIVER_FILE="amdgpu-pro-22.40-2211043-ubuntu-20.04.tar.xz"
            DRIVER_DIR="amdgpu-pro-22.40-2211043-ubuntu-20.04"
            DRIVER_URL="https://drivers.amd.com/drivers/linux/$DRIVER_FILE"
            ;;
        jammy|22.04)
            # Try to use amdgpu-install for 22.04
            echo "📥 Installing via amdgpu-install for Ubuntu 22.04..."
            wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -
            echo "deb [arch=amd64] https://repo.radeon.com/amdgpu-install/6.0.2/ubuntu/jammy/ jammy main" | sudo tee /etc/apt/sources.list.d/amdgpu.list
            sudo apt update
            sudo apt install -y amdgpu-install
            sudo amdgpu-install --usecase=opencl --no-dkms -y
            echo "✅ AMDGPU drivers installed via amdgpu-install"
            cd ~
            INSTALL_METHOD="amdgpu-install"
            ;;
        noble|24.04)
            # Use amdgpu-install for 24.04
            echo "📥 Installing via amdgpu-install for Ubuntu 24.04..."
            wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -
            echo "deb [arch=amd64] https://repo.radeon.com/amdgpu-install/6.1/ubuntu/noble/ noble main" | sudo tee /etc/apt/sources.list.d/amdgpu.list
            sudo apt update
            sudo apt install -y amdgpu-install
            sudo amdgpu-install --usecase=opencl --no-dkms -y
            echo "✅ AMDGPU drivers installed via amdgpu-install"
            cd ~
            INSTALL_METHOD="amdgpu-install"
            ;;
        *)
            echo "⚠️  Unknown Ubuntu version, trying Ubuntu 20.04 driver..."
            DRIVER_FILE="amdgpu-pro-22.40-2211043-ubuntu-20.04.tar.xz"
            DRIVER_DIR="amdgpu-pro-22.40-2211043-ubuntu-20.04"
            DRIVER_URL="https://drivers.amd.com/drivers/linux/$DRIVER_FILE"
            ;;
    esac
    
    if [ "$INSTALL_METHOD" != "amdgpu-install" ]; then
        # Download and install legacy AMDGPU Pro
        if [ ! -f "$DRIVER_FILE" ]; then
            echo "📥 Downloading AMDGPU Pro drivers (this may take a while)..."
            if ! wget "$DRIVER_URL"; then
                echo "❌ Failed to download AMDGPU Pro drivers"
                echo "💡 Trying Mesa drivers as fallback..."
                sudo apt install -y mesa-opencl-icd opencl-headers
                INSTALL_METHOD="mesa-fallback"
            fi
        fi
        
        if [ "$INSTALL_METHOD" != "mesa-fallback" ]; then
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
                echo "💡 Trying Mesa drivers as fallback..."
                sudo apt install -y mesa-opencl-icd opencl-headers
                INSTALL_METHOD="mesa-fallback"
            fi
        fi
    fi
fi

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