# AMD & NVIDIA Support Guide

## ✅ Full Support for Both GPU Vendors

QuaiMiner CORE fully supports **both AMD and NVIDIA GPUs**, including **mixed setups** with both vendors in the same rig.

## 🎮 Supported GPUs

### NVIDIA GPUs
- ✅ All NVIDIA GPUs (GTX, RTX series)
- ✅ Automatic driver detection and installation
- ✅ Power limit optimization
- ✅ Compute mode configuration
- ✅ Persistence mode

### AMD GPUs
- ✅ All AMD GPUs (RX series, Vega, Navi)
- ✅ Automatic driver detection and installation
- ✅ Architecture-specific optimizations:
  - **Polaris** (RX 580, RX 590)
  - **Vega** (RX Vega series)
  - **Navi** (RX 5000, 6000, 7000 series)
- ✅ OpenCL support
- ✅ ROCm support (Ubuntu 22.04+)

## 🔍 Automatic Detection

The hardware detector automatically identifies **both** NVIDIA and AMD GPUs:

```bash
sudo ./quaiminer-os/hardware-detector.sh
```

**Example Output:**
```
🎮 Detected GPUs:
  ✅ NVIDIA GPU #0: NVIDIA GeForce RTX 3060
  ✅ NVIDIA GPU #1: NVIDIA GeForce RTX 3070
  ✅ AMD GPU #2: AMD Radeon RX 590
  ✅ AMD GPU #3: AMD Radeon RX 580
```

## 🔧 Driver Management

The driver manager handles **both** vendors automatically:

```bash
sudo ./quaiminer-os/driver-manager.sh
```

**What it does:**
1. Detects all NVIDIA GPUs → Installs NVIDIA drivers
2. Detects all AMD GPUs → Installs AMD drivers
3. Works with mixed setups (both vendors)

### NVIDIA Drivers
- Installs via Ubuntu PPA
- Auto-detects recommended version
- Supports latest drivers (535, 525, etc.)

### AMD Drivers
- **Ubuntu 22.04+**: Mesa OpenCL drivers (recommended)
- **Ubuntu 20.04**: AMDGPU Pro drivers
- ROCm support for better performance

## ⚡ GPU Optimization

Each GPU is optimized based on its vendor and architecture:

### NVIDIA Optimization
```bash
# Applied automatically:
- Power limit: 80% of maximum
- Persistence mode: Enabled
- Compute mode: EXCLUSIVE_PROCESS
- Memory overclock: Recommended settings
```

### AMD Optimization
```bash
# Applied automatically based on architecture:
- Polaris (RX 580/590): Core 1545MHz, Memory 2000MHz
- Vega: Architecture-specific settings
- Navi: Architecture-specific settings
- Environment variables: ROC_ENABLE_PRE_VEGA, etc.
```

## 🎯 Mixed Setup Example

### Scenario: 2 NVIDIA + 2 AMD GPUs

```bash
# 1. Detect all GPUs
sudo ./quaiminer-os/hardware-detector.sh
# Output: 4 GPUs detected (2 NVIDIA, 2 AMD)

# 2. Install drivers for both
sudo ./quaiminer-os/driver-manager.sh
# Installs NVIDIA drivers for GPUs 0-1
# Installs AMD drivers for GPUs 2-3

# 3. Optimize all GPUs
sudo ./quaiminer-os/gpu-optimizer.sh
# Optimizes NVIDIA GPUs with nvidia-smi
# Optimizes AMD GPUs with architecture-specific settings

# 4. Start mining on all GPUs
curl -X POST http://localhost:3000/api/miner/start
# Starts 4 miner processes (one per GPU)
```

## 📊 Hardware Info JSON

The hardware detector creates a unified JSON with both vendors:

```json
{
  "gpus": [
    {
      "index": 0,
      "vendor": "nvidia",
      "model": "NVIDIA GeForce RTX 3060",
      "memory_mb": 12288,
      "driver_version": "535.54.03"
    },
    {
      "index": 1,
      "vendor": "nvidia",
      "model": "NVIDIA GeForce RTX 3070",
      "memory_mb": 8192,
      "driver_version": "535.54.03"
    },
    {
      "index": 2,
      "vendor": "amd",
      "model": "AMD Radeon RX 590",
      "architecture": "polaris20",
      "opencl_available": true
    },
    {
      "index": 3,
      "vendor": "amd",
      "model": "AMD Radeon RX 580",
      "architecture": "polaris",
      "opencl_available": true
    }
  ]
}
```

## 🚀 Mining with Mixed GPUs

### Start All GPUs
```bash
curl -X POST http://localhost:3000/api/miner/start
```

### Start Specific GPUs
```bash
# Start only NVIDIA GPUs (0, 1)
curl -X POST http://localhost:3000/api/miner/start \
  -H "Content-Type: application/json" \
  -d '{"gpu_indices": [0, 1]}'

# Start only AMD GPUs (2, 3)
curl -X POST http://localhost:3000/api/miner/start \
  -H "Content-Type: application/json" \
  -d '{"gpu_indices": [2, 3]}'
```

### Per-GPU Control
```bash
# Stop NVIDIA GPU 0
curl -X POST http://localhost:3000/api/miner/stop \
  -H "Content-Type: application/json" \
  -d '{"gpu_index": 0}'

# Stop AMD GPU 2
curl -X POST http://localhost:3000/api/miner/stop \
  -H "Content-Type: application/json" \
  -d '{"gpu_index": 2}'
```

## 📈 Dashboard Display

The dashboard shows all GPUs with vendor-specific information:

- **NVIDIA GPUs**: Show driver version, power consumption, temperature
- **AMD GPUs**: Show architecture, OpenCL status, temperature
- **Mixed setups**: All GPUs displayed together with vendor indicators

## ⚙️ Environment Variables

### NVIDIA GPUs
No special environment variables needed (handled by nvidia-smi)

### AMD GPUs
Automatically set based on architecture:
```bash
# Polaris (RX 580/590)
export ROC_ENABLE_PRE_VEGA=1
export HSA_OVERRIDE_GFX_VERSION=8.0.0
export GPU_FORCE_64BIT_PTR=1
export GPU_MAX_HEAP_SIZE=100
export GPU_USE_SYNC_OBJECTS=1
```

## 🔍 Verification

### Check NVIDIA GPUs
```bash
nvidia-smi
```

### Check AMD GPUs
```bash
clinfo
```

### Check All GPUs
```bash
curl http://localhost:3000/api/gpus
```

## 🛠️ Troubleshooting

### NVIDIA GPU Not Detected
```bash
# Check NVIDIA driver
nvidia-smi

# Reinstall if needed
sudo ./quaiminer-os/driver-manager.sh
```

### AMD GPU Not Detected
```bash
# Check AMD driver
clinfo

# Reinstall if needed
sudo ./quaiminer-os/driver-manager.sh
```

### Mixed Setup Issues
```bash
# Verify both drivers are installed
nvidia-smi && clinfo

# Re-run hardware detection
sudo ./quaiminer-os/hardware-detector.sh

# Re-run driver manager
sudo ./quaiminer-os/driver-manager.sh
```

## 📋 Best Practices

1. **Install drivers for both vendors** before optimizing
2. **Reboot after driver installation** for both vendors
3. **Verify both work** with `nvidia-smi` and `clinfo`
4. **Optimize separately** - each vendor has different tools
5. **Monitor temperatures** - different GPUs may have different thermal limits

## 🎯 Example: Complete Mixed Setup

```bash
# Step 1: Detect all GPUs (NVIDIA + AMD)
sudo ./quaiminer-os/hardware-detector.sh

# Step 2: Install drivers for both
sudo ./quaiminer-os/driver-manager.sh
# This will:
# - Install NVIDIA drivers if NVIDIA GPUs detected
# - Install AMD drivers if AMD GPUs detected
# - Handle both automatically

# Step 3: Reboot (recommended)
sudo reboot

# Step 4: Optimize all GPUs
sudo ./quaiminer-os/gpu-optimizer.sh
# This will:
# - Optimize NVIDIA GPUs with nvidia-smi
# - Optimize AMD GPUs with architecture-specific settings

# Step 5: Start mining on all GPUs
curl -X POST http://localhost:3000/api/miner/start

# Step 6: Monitor in dashboard
# Open http://localhost:3000
# See all GPUs (NVIDIA and AMD) in one view
```

## ✅ Summary

- ✅ **Full support** for both AMD and NVIDIA
- ✅ **Automatic detection** of both vendors
- ✅ **Automatic driver installation** for both
- ✅ **Vendor-specific optimization** for both
- ✅ **Mixed setups** fully supported
- ✅ **Unified management** via dashboard
- ✅ **Per-GPU control** regardless of vendor

**You can mix and match AMD and NVIDIA GPUs in any combination!** 🎉

