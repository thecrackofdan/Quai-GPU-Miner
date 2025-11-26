# Multi-GPU & Multi-Rig Setup Guide

## 🎯 Overview

QuaiMiner CORE now supports **multi-GPU** and **multi-rig** setups with automatic hardware detection, driver management, and GPU optimization.

## 🚀 Quick Installation

### Single Command Installation

```bash
cd quaiminer-os
sudo ./install-unified.sh
```

This single command will:
1. ✅ Detect all GPUs (NVIDIA and AMD)
2. ✅ Install/update drivers automatically
3. ✅ Optimize GPU settings for Quai mining
4. ✅ Install quai-gpu-miner
5. ✅ Configure everything automatically

## 🔍 Hardware Detection

### Automatic Detection

The system automatically detects:
- **GPUs**: NVIDIA and AMD (all models)
- **CPU**: Model, cores, threads
- **Memory**: Total and available RAM
- **System**: OS version, kernel, architecture

### Manual Detection

```bash
sudo ./hardware-detector.sh
```

Output saved to: `/etc/quaiminer/hardware-info.json`

## 🔧 Driver Management

### Automatic Driver Installation

```bash
sudo ./driver-manager.sh
```

**Features:**
- Detects GPU vendors (NVIDIA/AMD)
- Installs appropriate drivers
- Checks for updates
- Configures automatically

**Supported:**
- NVIDIA: Latest drivers via PPA
- AMD: Mesa (Ubuntu 22.04+) or AMDGPU Pro (Ubuntu 20.04)

## ⚡ GPU Optimization

### Automatic Optimization

```bash
sudo ./gpu-optimizer.sh
```

**Optimizations Applied:**
- **NVIDIA:**
  - Power limit (80% of max)
  - Persistence mode
  - Compute mode
  - Memory overclock recommendations

- **AMD:**
  - Architecture-specific settings
  - Core/memory clock adjustments
  - Environment variables
  - Polaris/Vega/Navi optimizations

### Per-GPU Settings

Optimization config: `/etc/quaiminer/gpu-optimization.json`

## 🏭 Multi-Rig Management

### Register a Rig

```bash
sudo ./multi-rig-manager.sh register "Rig-Name" "192.168.1.100"
```

### List All Rigs

```bash
sudo ./multi-rig-manager.sh list
```

### Sync Rig Status

```bash
sudo ./multi-rig-manager.sh sync
```

## 🎮 Multi-GPU Mining

### Start Mining on All GPUs

```bash
# Via API
curl -X POST http://localhost:3000/api/miner/start

# Or via systemd
sudo systemctl start quaiminer
```

### Start Mining on Specific GPU

```bash
# Start GPU 0 only
curl -X POST http://localhost:3000/api/miner/start \
  -H "Content-Type: application/json" \
  -d '{"gpu_indices": [0]}'
```

### Stop Specific GPU

```bash
curl -X POST http://localhost:3000/api/miner/stop \
  -H "Content-Type: application/json" \
  -d '{"gpu_index": 0}'
```

## 📊 Dashboard Features

### Multi-GPU Visualization

The dashboard automatically shows:
- Individual GPU statistics
- Per-GPU hash rate
- Temperature monitoring
- Power consumption
- Start/stop controls per GPU

### Multi-Rig Monitoring

- View all rigs from one dashboard
- Remote start/stop
- Status synchronization
- Centralized logging

## ⚙️ Configuration

### Main Config

`/etc/quaiminer/config.json`:

```json
{
  "rig_id": "rig-hostname-abc123",
  "stratum_url": "stratum://localhost:3333",
  "node_rpc": "http://localhost:8545",
  "wallet": "0x...",
  "worker": "rig1",
  "gpu_count": 4,
  "auto_start": true,
  "optimization": {
    "enabled": true,
    "power_limit_percent": 80,
    "memory_overclock": 0,
    "core_underclock": 0
  }
}
```

### Per-GPU Config

Each GPU can have individual settings:
- Power limits
- Clock speeds
- Temperature targets
- Fan curves

## 🔍 Monitoring

### View GPU Status

```bash
# Via API
curl http://localhost:3000/api/gpus

# Via dashboard
# Open http://localhost:3000
```

### View Miner Logs

```bash
# All GPUs
curl http://localhost:3000/api/miner/logs

# Specific GPU
curl http://localhost:3000/api/miner/logs?gpu_index=0
```

## 🛠️ Troubleshooting

### GPU Not Detected

1. Run hardware detection:
   ```bash
   sudo ./hardware-detector.sh
   ```

2. Check drivers:
   ```bash
   sudo ./driver-manager.sh
   ```

3. Verify GPU:
   ```bash
   # NVIDIA
   nvidia-smi
   
   # AMD
   clinfo
   ```

### Driver Issues

```bash
# Reinstall drivers
sudo ./driver-manager.sh

# Check driver status
cat /etc/quaiminer/driver-config.json
```

### Optimization Not Applied

```bash
# Re-run optimizer
sudo ./gpu-optimizer.sh

# Check optimization status
cat /etc/quaiminer/gpu-optimization.json
```

## 📈 Performance Tips

1. **Power Limits**: Start at 80%, adjust based on stability
2. **Memory Overclock**: +500MHz is usually safe
3. **Core Underclock**: -200MHz for efficiency
4. **Temperature**: Keep below 75°C for longevity
5. **Multiple GPUs**: Ensure adequate PSU capacity

## 🔄 Updates

### Update Drivers

```bash
sudo ./driver-manager.sh
```

### Update Miner

```bash
cd /opt/quaiminer/quai-gpu-miner
git pull
make clean && make
```

### Update QuaiMiner CORE

```bash
cd /path/to/quaiminer-core
git pull
cd quaiminer-os
sudo ./install-unified.sh
```

## 📚 Additional Resources

- [Hardware Detection Guide](quaiminer-os/README.md#hardware-detection)
- [Driver Management](quaiminer-os/README.md#driver-management)
- [GPU Optimization](quaiminer-os/README.md#gpu-optimization)
- [Dashboard Documentation](miner-dashboard/README.md)

