# 🚀 Quick Start: Multi-GPU & Multi-Rig Setup

## ⚡ One-Command Installation

```bash
cd quaiminer-os
sudo ./install-unified.sh
```

**That's it!** This single command will:
1. ✅ Detect all your GPUs (NVIDIA & AMD)
2. ✅ Install/update drivers automatically
3. ✅ Optimize GPU settings for Quai mining
4. ✅ Install and configure quai-gpu-miner
5. ✅ Set up multi-GPU mining

## 📊 What You Get

### Automatic Detection
- **GPUs**: All NVIDIA and AMD GPUs detected automatically
- **Drivers**: Appropriate drivers installed automatically
- **Optimization**: GPU settings optimized for Quai mining

### Multi-GPU Support
- Mine with all GPUs simultaneously
- Start/stop individual GPUs
- Per-GPU monitoring and control

### Multi-Rig Management
- Register multiple rigs
- Monitor all rigs from one dashboard
- Centralized control

## 🎮 Using the Dashboard

1. **Start Dashboard:**
   ```bash
   cd miner-dashboard
   npm install
   npm start
   ```

2. **Open Browser:**
   ```
   http://localhost:3000
   ```

3. **Features:**
   - View all GPUs
   - Start/stop mining per GPU
   - Monitor hash rates
   - View temperatures
   - Check power consumption

## 🔧 Manual Commands

### Hardware Detection
```bash
sudo ./quaiminer-os/hardware-detector.sh
```

### Driver Management
```bash
sudo ./quaiminer-os/driver-manager.sh
```

### GPU Optimization
```bash
sudo ./quaiminer-os/gpu-optimizer.sh
```

### Register Rig
```bash
sudo ./quaiminer-os/multi-rig-manager.sh register "My-Rig" "192.168.1.100"
```

## 📚 Documentation

- [Multi-GPU Setup Guide](MULTI_GPU_SETUP.md) - Complete guide
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details
- [Project Structure](PROJECT_STRUCTURE.md) - File organization

## ✅ Testing

Run the test script to verify everything:
```bash
cd quaiminer-os
bash test-system.sh
```

## 🆘 Troubleshooting

### GPUs Not Detected
```bash
sudo ./quaiminer-os/hardware-detector.sh
```

### Driver Issues
```bash
sudo ./quaiminer-os/driver-manager.sh
```

### Optimization Not Applied
```bash
sudo ./quaiminer-os/gpu-optimizer.sh
```

## 🎯 Next Steps

1. Run unified installer
2. Configure your node RPC in `/etc/quaiminer/config.json`
3. Start mining via dashboard or API
4. Monitor your rigs

**That's it! You're ready to mine Quai with multiple GPUs!** 🎉

