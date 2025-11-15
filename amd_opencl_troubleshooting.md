# AMD RX 590 OpenCL Setup Guide - Ubuntu 20.04

## Current Status Check
Let's first check your current system status:

```bash
# Check if AMD GPU is detected
lspci | grep -i amd
lspci -nn | grep -i vga

# Check current OpenCL status
clinfo
```

## Step-by-Step Installation

### 1. Install Required Base Packages
```bash
sudo apt update
sudo apt install -y build-essential dkms linux-headers-$(uname -r)
sudo apt install -y clinfo lshw pciutils mesa-utils
```

### 2. Install AMDGPU Pro Drivers (Recommended for RX 590)

#### Option A: Using Ubuntu Repositories (Easier)
```bash
# Add AMD repository
sudo apt install software-properties-common
sudo add-apt-repository -y ppa:kisak/kisak-mesa
sudo apt update

# Install drivers
sudo apt install -y amdgpu-pro libdrm-amdgpu1
sudo apt install -y mesa-opencl-icd opencl-headers opencl-clhpp-dev
```

#### Option B: Using AMD Official Drivers (More recent)
```bash
# Download AMDGPU installer
wget https://repo.radeon.com/amdgpu-install/6.0.2/ubuntu/focal/amdgpu-install_6.0.60200-1_all.deb

# Install the package
sudo dpkg -i amdgpu-install_6.0.60200-1_all.deb

# Install with OpenCL support
sudo amdgpu-install --usecase=opencl --no-dkms

# Or for full ROCm support (better for mining)
sudo amdgpu-install --usecase=rocm,opencl --no-dkms
```

### 3. Configure User Permissions
```bash
# Add your user to necessary groups
sudo usermod -a -G render,video $USER

# Add current session to groups (or reboot)
newgrp render
newgrp video
```

### 4. Verify Installation
```bash
# Reboot for changes to take effect
sudo reboot

# After reboot, test OpenCL
clinfo
```

## Troubleshooting Common Issues

### Issue 1: clinfo shows "Number of platforms: 0"

**Solution:** Check if drivers are loaded properly
```bash
# Check kernel modules
lsmod | grep amdgpu

# Check GPU status
lshw -c display

# Check dmesg for AMD driver errors
dmesg | grep -i amdgpu
```

### Issue 2: Permission denied accessing GPU

**Solution:** Verify user groups and permissions
```bash
# Check current groups
groups

# Check GPU device permissions
ls -la /dev/dri/

# Add to render group if not already
sudo usermod -a -G render $USER
```

### Issue 3: AMD RX 590 not recognized

**Solution:** Force specific driver loading
```bash
# Create Xorg configuration
sudo bash -c 'cat > /etc/X11/xorg.conf.d/20-amdgpu.conf << EOF
Section "Device"
    Identifier "AMD"
    Driver "amdgpu"
    Option "TearFree" "true"
EndSection
EOF'

# Reboot
sudo reboot
```

### Issue 4: Quai miner still doesn't see GPU

**Solution:** Install ROCm for better OpenCL support
```bash
# Install ROCm packages
sudo apt update
sudo apt install -y rocm-dkms rocm-opencl-dev rocm-utils

# Set environment variables
echo 'export ROC_ENABLE_PRE_VEGA=1' >> ~/.bashrc
echo 'export HSA_OVERRIDE_GFX_VERSION=8.0.0' >> ~/.bashrc

# Reload shell
source ~/.bashrc
```

## Verification Commands

After installation, run these to verify everything works:

```bash
# Check OpenCL platforms
clinfo

# Check GPU details
rocm-smi  # if ROCm installed

# Test with simple OpenCL program
echo '#include <CL/cl.h>
#include <stdio.h>
int main() {
    cl_platform_id platform;
    cl_uint num_platforms;
    clGetPlatformIDs(1, &platform, &num_platforms);
    printf("Found %u OpenCL platforms\n", num_platforms);
    return 0;
}' > test_opencl.c

gcc -o test_opencl test_opencl.c -lOpenCL
./test_opencl
```

## For Quai Mining

If you're using Quai miner specifically, you may need:

```bash
# Export these before running miner
export ROC_ENABLE_PRE_VEGA=1
export GPU_FORCE_64BIT_PTR=1
export GPU_MAX_HEAP_SIZE=100
export GPU_USE_SYNC_OBJECTS=1
export GPU_MAX_ALLOC_PERCENT=100
export GPU_SINGLE_ALLOC_PERCENT=100
```

## Quick Test Script

Run this script to test your setup:

```bash
#!/bin/bash
echo "=== AMD OpenCL Status Check ==="
echo "GPU detected:"
lspci | grep -i amd
echo ""
echo "OpenCL platforms:"
clinfo | head -20
echo ""
echo "GPU devices:"
clinfo | grep -A 10 "Device Name"
```