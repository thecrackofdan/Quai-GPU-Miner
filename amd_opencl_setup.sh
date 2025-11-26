#!/bin/bash

# AMD RX 590 OpenCL Setup Script for Ubuntu (20.04, 22.04, 24.04+)
# This script helps install and configure OpenCL for AMD GPUs
# Automatically detects Ubuntu version

# Detect Ubuntu version
if command -v lsb_release &> /dev/null; then
    UBUNTU_VERSION=$(lsb_release -rs)
    UBUNTU_CODENAME=$(lsb_release -cs)
elif [ -f /etc/os-release ]; then
    UBUNTU_VERSION=$(grep VERSION_ID /etc/os-release | cut -d'"' -f2)
    UBUNTU_CODENAME=$(grep VERSION_CODENAME /etc/os-release | cut -d'=' -f2)
else
    UBUNTU_VERSION="Unknown"
    UBUNTU_CODENAME="unknown"
fi

echo "🔧 AMD RX 590 OpenCL Setup for Ubuntu $UBUNTU_VERSION"
echo "============================================"

# Check current system info
echo "📋 System Information:"
if command -v lsb_release &> /dev/null; then
    echo "OS: $(lsb_release -d | cut -f2)"
else
    echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2 2>/dev/null || echo "Unknown")"
fi
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo ""

# Check if GPU is detected by the system
echo "🔍 Checking for AMD GPU detection:"
if command -v lspci &> /dev/null; then
    lspci | grep -i amd || echo "No AMD GPU detected via lspci"
else
    echo "lspci not available - will be installed"
fi
echo ""

# Install basic tools if not present
echo "📦 Installing required tools..."
if ! sudo apt update; then
    echo "⚠️  Failed to update package lists"
fi
if ! sudo apt install -y clinfo lshw pciutils; then
    echo "⚠️  Failed to install some tools, but continuing..."
fi

# Check if OpenCL is currently working
echo "🧪 Testing current OpenCL status:"
clinfo 2>/dev/null || echo "❌ OpenCL not currently working"
echo ""

echo "🎯 Next Steps for AMD OpenCL Setup:"
echo "=================================="
echo "1. Install AMDGPU proprietary drivers"
echo "2. Install ROCm OpenCL runtime"
echo "3. Configure user permissions"
echo "4. Verify OpenCL functionality"
echo ""

echo "📝 Manual Installation Commands:"
echo "================================"
echo "# Step 1: Add AMD repository"
echo "sudo apt install software-properties-common"
echo "sudo add-apt-repository -y ppa:kisak/kisak-mesa"
echo "sudo apt update"
echo ""
echo "# Step 2: Install AMD drivers"
echo "sudo apt install amdgpu-pro mesa-opencl-icd opencl-headers"
echo ""
echo "# Step 3: Install ROCm (optional but recommended)"
echo "wget https://repo.radeon.com/amdgpu-install/6.0.2/ubuntu/focal/amdgpu-install_6.0.60200-1_all.deb"
echo "sudo dpkg -i amdgpu-install_6.0.60200-1_all.deb"
echo "sudo amdgpu-install --usecase=rocm,opencl --no-dkms"
echo ""
echo "# Step 4: Add user to render group"
echo "sudo usermod -a -G render,video \$LOGNAME"
echo ""
echo "# Step 5: Reboot and test"
echo "sudo reboot"
echo "clinfo"