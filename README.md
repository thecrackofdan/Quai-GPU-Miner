# ⚡ Quai GPU Miner

**The easiest way to mine Quai Network - Sophisticated interface with automatic GPU detection and setup**

> One command to get started. Beautiful dashboard with Quai-specific metrics, SOAP features, and profitability tracking.

## 🚀 Quick Start

### One-Command Setup

```bash
sudo ./setup.sh
```

That's it! This single command will:
- ✅ **Detect your GPU** (NVIDIA or AMD)
- ✅ **Install drivers** automatically
- ✅ **Install quai-gpu-miner** from source
- ✅ **Set up web interface** for easy configuration
- ✅ **Create systemd service** for auto-start

### After Setup

1. **Start the web interface:**
   ```bash
   cd miner-dashboard
   npm start
   ```
   Open `http://localhost:3000` in your browser

2. **Configure your miner:**
   - Enter your wallet address
   - Select a mining pool
   - Click "Start Mining"

3. **Enable auto-start (optional):**
   ```bash
   sudo systemctl enable quai-gpu-miner
   sudo systemctl start quai-gpu-miner
   ```

## 🎮 Supported GPUs

### NVIDIA
- ✅ All NVIDIA GPUs (GTX, RTX series)
- ✅ Automatic driver installation
- ✅ Optimized settings for mining

### AMD
- ✅ All AMD GPUs (RX series, Vega, Navi)
- ✅ Automatic OpenCL driver installation
- ✅ Architecture-specific optimizations

## 📋 Requirements

- **OS**: Linux (Ubuntu 20.04+ or Debian 11+)
- **GPU**: NVIDIA or AMD (ProgPoW compatible)
- **RAM**: 4GB minimum
- **Storage**: 10GB+ free space
- **Internet**: Required for driver downloads

## 🔧 Manual Setup (if needed)

If the automatic setup doesn't work for your system:

### NVIDIA Setup
```bash
# Install drivers
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt-get update
sudo ubuntu-drivers autoinstall
sudo reboot
```

### AMD Setup
```bash
# Install OpenCL drivers
sudo apt-get update
sudo apt-get install -y mesa-opencl-icd opencl-headers ocl-icd-libopencl1 clinfo
```

### Install Miner
```bash
git clone https://github.com/dominant-strategies/quai-gpu-miner.git
cd quai-gpu-miner
mkdir build && cd build
cmake ..
make -j$(nproc)
```

## 📚 Documentation

- [GPU Detection Guide](docs/GPU_DETECTION.md) - How GPU detection works
- [Driver Installation](docs/DRIVERS.md) - Manual driver setup
- [Mining Configuration](docs/MINING_CONFIG.md) - Configure your miner
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🛠️ Troubleshooting

### GPU Not Detected
```bash
# Check if GPU is visible
lspci | grep -i "vga\|3d"

# Check NVIDIA
nvidia-smi

# Check AMD
clinfo
```

### Drivers Not Working
```bash
# Re-run setup
sudo ./setup.sh

# Or manually install drivers
sudo ./quaiminer-os/driver-manager.sh
```

### Miner Won't Start
```bash
# Check logs
sudo journalctl -u quai-gpu-miner -f

# Check miner directly
cd /opt/quai-gpu-miner/build
./ethcoreminer -G
```

## 🌐 Sophisticated Web Interface

The web interface provides everything you need for profitable Quai mining:

### Core Features
- **Automatic GPU Detection** - Detects and configures NVIDIA & AMD GPUs
- **One-Click Setup** - Get mining in minutes, not hours
- **Real-time Monitoring** - Hash rate, temperature, shares, power usage
- **Easy Controls** - Start/stop mining with one click

### Quai-Specific Features
- **Chain Profitability Comparison** - See which chain (Prime, Regions, Zones) is most profitable
- **Auto Chain Switching** - Automatically mines the most profitable chain
- **SOAP Staking** - Track staking rewards and multipliers
- **Merge Mining Support** - Mine multiple chains simultaneously
- **LMT/LMR Tracking** - Monitor Liquid Mining Tokens and Locked Mining Rewards
- **Zone Sharding** - Automatically select most profitable zones when sharding is active
- **Comprehensive Profitability** - Daily, weekly, monthly, yearly projections
- **Efficiency Metrics** - Hash per watt, profit per watt, ROI calculations

### Advanced Features
- **Alert System** - Email, Telegram, Discord notifications
- **Difficulty Tracking** - Real-time difficulty monitoring across all chains
- **Historical Data** - Track performance over time
- **Mobile Responsive** - Access your miner from anywhere

Access at: `http://localhost:3000`

## 🤝 Contributing

Contributions welcome! This project aims to make Quai mining as easy as possible.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## ⚠️ Disclaimer

This software modifies system drivers and configurations. Use at your own risk. Always backup your system before running installation scripts.

---

**Quai GPU Miner** - Making Quai Network mining accessible to everyone
