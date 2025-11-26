# Mixed AMD & NVIDIA GPU Setup Example

## 🎯 Real-World Example: 2 NVIDIA + 2 AMD GPUs

This guide shows a complete setup with both GPU vendors in the same rig.

## 📋 Hardware Configuration

- **GPU 0**: NVIDIA GeForce RTX 3060 (12GB)
- **GPU 1**: NVIDIA GeForce RTX 3070 (8GB)
- **GPU 2**: AMD Radeon RX 590 (8GB)
- **GPU 3**: AMD Radeon RX 580 (8GB)

## 🚀 Step-by-Step Setup

### Step 1: Hardware Detection

```bash
sudo ./quaiminer-os/hardware-detector.sh
```

**Expected Output:**
```
🎮 Detecting GPUs...
  Checking for NVIDIA GPUs...
  ✅ NVIDIA GPU #1: NVIDIA GeForce RTX 3060
  ✅ NVIDIA GPU #2: NVIDIA GeForce RTX 3070
  Checking for AMD GPUs...
  ✅ AMD GPU #3: AMD Radeon RX 590
  ✅ AMD GPU #4: AMD Radeon RX 580
✅ Detected 4 GPU(s)
```

**Hardware Info Saved:**
```json
{
  "gpus": [
    {"index": 0, "vendor": "nvidia", "model": "NVIDIA GeForce RTX 3060"},
    {"index": 1, "vendor": "nvidia", "model": "NVIDIA GeForce RTX 3070"},
    {"index": 2, "vendor": "amd", "model": "AMD Radeon RX 590"},
    {"index": 3, "vendor": "amd", "model": "AMD Radeon RX 580"}
  ]
}
```

### Step 2: Driver Installation

```bash
sudo ./quaiminer-os/driver-manager.sh
```

**What Happens:**
1. Detects 2 NVIDIA GPUs → Installs NVIDIA drivers
2. Detects 2 AMD GPUs → Installs AMD drivers
3. Both installed automatically

**Expected Output:**
```
🎮 Detected GPUs:
  NVIDIA: 2
  AMD: 2

📥 Installing NVIDIA drivers...
✅ NVIDIA driver installed: 535.54.03

📥 Installing AMD drivers...
✅ AMD driver installed
```

### Step 3: Reboot (Recommended)

```bash
sudo reboot
```

### Step 4: Verify Both Drivers

```bash
# Check NVIDIA
nvidia-smi
# Should show 2 GPUs

# Check AMD
clinfo
# Should show AMD OpenCL platform
```

### Step 5: GPU Optimization

```bash
sudo ./quaiminer-os/gpu-optimizer.sh
```

**What Happens:**
- **NVIDIA GPUs (0, 1)**: Power limits, persistence mode, compute mode
- **AMD GPUs (2, 3)**: Polaris optimizations, environment variables

**Expected Output:**
```
🎮 Found 4 GPU(s) to optimize

GPU #0: nvidia NVIDIA GeForce RTX 3060
  Optimizing NVIDIA GPU #0...
    ✅ Power limit set to 170W
    ✅ Persistence mode enabled
    ✅ Compute mode set

GPU #1: nvidia NVIDIA GeForce RTX 3070
  Optimizing NVIDIA GPU #1...
    ✅ Power limit set to 220W
    ✅ Persistence mode enabled
    ✅ Compute mode set

GPU #2: amd AMD Radeon RX 590
  Optimizing AMD GPU #2...
    Applying Polaris optimizations...
    ✅ Polaris optimizations applied

GPU #3: amd AMD Radeon RX 580
  Optimizing AMD GPU #3...
    Applying Polaris optimizations...
    ✅ Polaris optimizations applied

✅ GPU optimization complete!
```

### Step 6: Start Mining

#### Option A: Start All GPUs
```bash
curl -X POST http://localhost:3000/api/miner/start
```

#### Option B: Start Specific GPUs
```bash
# Start only NVIDIA GPUs
curl -X POST http://localhost:3000/api/miner/start \
  -H "Content-Type: application/json" \
  -d '{"gpu_indices": [0, 1]}'

# Start only AMD GPUs
curl -X POST http://localhost:3000/api/miner/start \
  -H "Content-Type: application/json" \
  -d '{"gpu_indices": [2, 3]}'
```

### Step 7: Monitor in Dashboard

Open `http://localhost:3000` to see:
- All 4 GPUs displayed
- Vendor indicators (NVIDIA/AMD)
- Per-GPU statistics
- Individual start/stop controls

## 📊 Expected Performance

### Hash Rates (Approximate)
- **RTX 3060**: ~15-18 MH/s
- **RTX 3070**: ~20-25 MH/s
- **RX 590**: ~10-12 MH/s
- **RX 580**: ~9-11 MH/s
- **Total**: ~54-66 MH/s combined

### Power Consumption
- **RTX 3060**: ~170W (optimized)
- **RTX 3070**: ~220W (optimized)
- **RX 590**: ~150W
- **RX 580**: ~140W
- **Total**: ~680W

## 🔧 Per-GPU Control Examples

### Stop One GPU
```bash
# Stop NVIDIA GPU 0
curl -X POST http://localhost:3000/api/miner/stop \
  -H "Content-Type: application/json" \
  -d '{"gpu_index": 0}'
```

### Restart One GPU
```bash
# Restart AMD GPU 2
curl -X POST http://localhost:3000/api/miner/restart \
  -H "Content-Type: application/json" \
  -d '{"gpu_index": 2}'
```

### View Per-GPU Logs
```bash
# NVIDIA GPU 0 logs
curl http://localhost:3000/api/miner/logs?gpu_index=0

# AMD GPU 2 logs
curl http://localhost:3000/api/miner/logs?gpu_index=2
```

## 🎯 Configuration File

`/etc/quaiminer/config.json`:
```json
{
  "rig_id": "mixed-rig-abc123",
  "stratum_url": "stratum://localhost:3333",
  "node_rpc": "http://localhost:8545",
  "wallet": "0x...",
  "worker": "mixed-rig",
  "gpu_count": 4,
  "auto_start": true,
  "optimization": {
    "enabled": true,
    "nvidia_power_limit_percent": 80,
    "amd_core_clock": 1545,
    "amd_memory_clock": 2000
  }
}
```

## ✅ Verification Checklist

- [ ] All 4 GPUs detected
- [ ] NVIDIA drivers installed (nvidia-smi works)
- [ ] AMD drivers installed (clinfo shows AMD)
- [ ] All GPUs optimized
- [ ] Mining starts on all GPUs
- [ ] Dashboard shows all 4 GPUs
- [ ] Per-GPU control works
- [ ] Logs available for each GPU

## 🐛 Troubleshooting

### NVIDIA GPUs Not Detected
```bash
nvidia-smi
# If fails, reinstall:
sudo ./quaiminer-os/driver-manager.sh
```

### AMD GPUs Not Detected
```bash
clinfo
# If fails, reinstall:
sudo ./quaiminer-os/driver-manager.sh
```

### Mixed Setup Issues
```bash
# Re-detect hardware
sudo ./quaiminer-os/hardware-detector.sh

# Re-install drivers
sudo ./quaiminer-os/driver-manager.sh

# Re-optimize
sudo ./quaiminer-os/gpu-optimizer.sh
```

## 📈 Monitoring

### Check All GPUs
```bash
curl http://localhost:3000/api/gpus
```

### Check Miner Status
```bash
curl http://localhost:3000/api/miner/status
```

### Dashboard
Open `http://localhost:3000` for real-time monitoring of all GPUs.

## 🎉 Success!

You now have a fully functional mixed GPU mining rig with:
- ✅ 2 NVIDIA GPUs mining
- ✅ 2 AMD GPUs mining
- ✅ All GPUs optimized
- ✅ Centralized control
- ✅ Per-GPU monitoring

**Total Hash Rate**: ~54-66 MH/s
**Total Power**: ~680W

