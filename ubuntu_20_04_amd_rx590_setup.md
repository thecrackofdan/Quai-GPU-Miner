# AMD RX 590 OpenCL Setup Guide for Ubuntu 20.04

## Step 1: Verify Your Hardware
First, confirm your RX 590 is detected on your Ubuntu machine:

```bash
# Check if RX 590 is detected
lspci | grep -i "Radeon\|AMD"
lspci -nn | grep -i vga

# You should see something like:
# 01:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Polaris 20 XL [Radeon RX 590 8GB] [1002:67df]
```

## Step 2: Remove Old Drivers (If Any)
```bash
# Remove any existing NVIDIA drivers (just in case)
sudo apt purge nvidia* -y
sudo apt autoremove -y

# Remove old AMD drivers
sudo apt purge amdgpu* -y
sudo apt autoremove -y
```

## Step 3: Install Required Dependencies
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install build tools
sudo apt install -y build-essential dkms linux-headers-$(uname -r)
sudo apt install -y wget gdebi-core software-properties-common
sudo apt install -y clinfo mesa-utils
```

## Step 4: Install AMDGPU Pro Drivers

### Option A: Official AMD Drivers (Recommended for RX 590)
```bash
# Download AMDGPU Pro 22.40 for Ubuntu 20.04
cd ~/Downloads
wget https://drivers.amd.com/drivers/linux/amdgpu-pro-22.40-2211043-ubuntu-20.04.tar.xz

# Extract the installer
tar -Jxvf amdgpu-pro-22.40-2211043-ubuntu-20.04.tar.xz
cd amdgpu-pro-22.40-2211043-ubuntu-20.04

# Install the drivers
sudo ./amdgpu-pro-install --opencl=rocm,legacy --no-dkms

# Alternative minimal install (if above fails):
# sudo ./amdgpu-pro-install --opencl=legacy --no-dkms
```

### Option B: Ubuntu Mesa Drivers (Simpler but less performant)
```bash
# Add Kisak's Mesa PPA for latest drivers
sudo add-apt-repository ppa:kisak/kisak-mesa -y
sudo apt update

# Install Mesa drivers with OpenCL support
sudo apt install -y mesa-vulkan-drivers mesa-vdpau-drivers
sudo apt install -y mesa-opencl-icd opencl-headers
```

## Step 5: Configure User Permissions
```bash
# Add your user to necessary groups
sudo usermod -a -G render,video $USER

# Check current groups
groups

# Create udev rule for GPU access
sudo bash -c 'cat > /etc/udev/rules.d/99-amdgpu.rules << EOF
KERNEL=="card[0-9]*", GROUP="render", MODE="0660"
KERNEL=="renderD[0-9]*", GROUP="render", MODE="0660"
EOF'

# Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Step 6: Install ROCm (Optional but Recommended for Mining)
```bash
# Add ROCm repository
wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -
echo 'deb [arch=amd64] https://repo.radeon.com/rocm/apt/5.7 ubuntu main' | sudo tee /etc/apt/sources.list.d/rocm.list

# Update package list
sudo apt update

# Install ROCm components
sudo apt install -y rocm-dkms rocm-opencl-dev rocm-utils
sudo apt install -y hipblas hipsolver rocm-cmake

# Add user to rocm group
sudo usermod -a -G rocm $USER

# Set ROCm environment variables
echo 'export PATH=$PATH:/opt/rocm/bin:/opt/rocm/opencl/bin' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/rocm/lib' >> ~/.bashrc
echo 'export ROC_ENABLE_PRE_VEGA=1' >> ~/.bashrc
echo 'export HSA_OVERRIDE_GFX_VERSION=8.0.0' >> ~/.bashrc
```

## Step 7: Reboot and Test
```bash
# Reboot to load all drivers
sudo reboot

# After reboot, test OpenCL
clinfo

# Check GPU details
rocm-smi  # if ROCm installed
lshw -c display
```

## Step 8: Verify Quai Miner Compatibility

### Test OpenCL with Simple Program
```bash
# Create a test OpenCL program
cat > test_opencl.c << 'EOF'
#include <CL/cl.h>
#include <stdio.h>

int main() {
    cl_platform_id platforms[10];
    cl_uint num_platforms;
    cl_device_id devices[10];
    cl_uint num_devices;
    
    // Get platforms
    cl_int result = clGetPlatformIDs(10, platforms, &num_platforms);
    printf("Found %u OpenCL platforms\n", num_platforms);
    
    for (cl_uint i = 0; i < num_platforms; i++) {
        char platform_name[1024];
        clGetPlatformInfo(platforms[i], CL_PLATFORM_NAME, sizeof(platform_name), platform_name, NULL);
        printf("Platform %u: %s\n", i, platform_name);
        
        // Get devices for this platform
        clGetDeviceIDs(platforms[i], CL_DEVICE_TYPE_GPU, 10, devices, &num_devices);
        printf("  Found %u GPU devices\n", num_devices);
        
        for (cl_uint j = 0; j < num_devices; j++) {
            char device_name[1024];
            clGetDeviceInfo(devices[j], CL_DEVICE_NAME, sizeof(device_name), device_name, NULL);
            printf("    Device %u: %s\n", j, device_name);
        }
    }
    
    return 0;
}
EOF

# Compile and run
gcc -o test_opencl test_opencl.c -lOpenCL
./test_opencl
```

### Environment Variables for Mining
```bash
# Add these to your mining script or ~/.bashrc
export ROC_ENABLE_PRE_VEGA=1
export GPU_FORCE_64BIT_PTR=1
export GPU_MAX_HEAP_SIZE=100
export GPU_USE_SYNC_OBJECTS=1
export GPU_MAX_ALLOC_PERCENT=100
export GPU_SINGLE_ALLOC_PERCENT=100
export HSA_OVERRIDE_GFX_VERSION=8.0.0
```

## Troubleshooting Common Issues

### Issue 1: clinfo still shows 0 platforms
```bash
# Check if amdgpu driver is loaded
lsmod | grep amdgpu

# Check GPU status
lshw -c display

# Check dmesg for errors
dmesg | grep -i amdgpu

# Reinstall drivers if needed
sudo apt purge amdgpu-pro*
sudo ./amdgpu-pro-install --opencl=legacy --no-dkms
```

### Issue 2: Permission denied errors
```bash
# Check GPU device permissions
ls -la /dev/dri/

# Add to render group again
sudo usermod -a -G render $USER
newgrp render

# Or try running as root (temporarily for testing)
sudo clinfo
```

### Issue 3: RX 590 not recognized
```bash
# Force specific driver
sudo bash -c 'cat > /etc/modprobe.d/amdgpu.conf << EOF
options amdgpu si_support=1
options amdgpu cik_support=1
EOF'

# Update initramfs
sudo update-initramfs -u -k all

# Reboot
sudo reboot
```

### Issue 4: Quai miner doesn't detect GPU
```bash
# Install additional OpenCL runtimes
sudo apt install -y intel-opencl-icd nvidia-opencl-icd

# Test with specific OpenCL platform
export OPENCL_PLATFORMS=AMD
./quai-miner --help
```

## Quick Verification Script
Save this as `verify_setup.sh` and run it:

```bash
#!/bin/bash
echo "=== AMD RX 590 OpenCL Verification ==="
echo "1. GPU Detection:"
lspci | grep -i "Radeon\|AMD"
echo ""
echo "2. OpenCL Platforms:"
clinfo | head -20
echo ""
echo "3. GPU Devices:"
clinfo | grep -A 5 "Device Name"
echo ""
echo "4. Driver Status:"
lsmod | grep amdgpu
echo ""
echo "5. GPU Device Permissions:"
ls -la /dev/dri/ | grep -E "(card|render)"
```

## Expected Output
When everything works correctly, you should see:

```
Number of platforms                               1
  Platform Name                                   AMD Accelerated Parallel Processing
  Platform Vendor                                 Advanced Micro Devices, Inc.
Number of devices                                 1
  Device Name                                     Polaris 20 XL [Radeon RX 590 8GB]
  Device Vendor                                   Advanced Micro Devices, Inc.
```

## Next Steps for Quai Mining
Once OpenCL is working:

1. Download the Quai miner binary
2. Set the environment variables above
3. Run the miner with your pool/wallet settings
4. Monitor GPU temps and hashrate

Good luck with your mining setup! 🚀