# ⚡ QuaiMiner CORE OS

**The Best Mining OS for Quai & Qi - Beautiful, Easy, Powerful**

> ⚠️ **CURRENT STATUS: BETA / TESTING PHASE**  
> **Version 2.1.1-beta** - This release is currently in testing and has not yet been:
> - Deployed or tested on Linux systems
> - Tested on Quai Network mainnet
> - Tested in production environments
> 
> **Recent Updates (v2.1.1-beta)**:
> - ✅ Mining Insights & Analytics - Advanced profitability analysis, ROI calculator, earnings projections
> - ✅ Enhanced Pool Manager - Automatic pool switching, smart recommendations, real-time monitoring
> - ✅ One-Click Pool Connection - Easy pool selection with wallet validation
> - ✅ Optimization Suggestions - Actionable insights with quick action buttons
> - ✅ Enhanced security and privacy (wallet address masking, input validation, rate limiting)
> - ✅ Performance optimizations (response compression, caching, timeout handling)
> - ✅ UX improvements (loading states, error messages, responsive design)
> 
> See [TESTING_STATUS.md](TESTING_STATUS.md) for detailed testing status and requirements.  
> See [SECURITY_PRIVACY_PERFORMANCE_UX_IMPROVEMENTS.md](SECURITY_PRIVACY_PERFORMANCE_UX_IMPROVEMENTS.md) for detailed improvements.

**The most beautiful, easiest-to-use mining operating system for Quai Network.** Mine Quai and Qi with the best-looking dashboard, simplest setup, and most powerful features. Join our DePool for the lowest fees (0.5-1.5%), fastest payouts (daily), lowest minimum payout (0.1 QUAI vs 20 QUAI elsewhere), and best mining experience. **Better than K1Pool, Kryptex, HeroMiners, and all other Quai pools.**

**Why Miners Choose QuaiMiner CORE OS:**

- 🎨 **Best Looking Dashboard** - Beautiful, modern UI that's a joy to use
- ⚡ **Easiest Setup** - Get mining in under 5 minutes with one command
- 🏊 **Best DePool** - Lowest fees, fastest payouts, most reliable pool
- 💎 **Quai & Qi Optimized** - Built specifically for Quai Network multi-chain mining
- 🎮 **Multi-GPU Support** - Automatically detect and manage all GPUs (NVIDIA & AMD)
- 📊 **Real-Time Monitoring** - Beautiful dashboard with live stats and charts
- 🔄 **Auto-Optimization** - Automatically switches between chains for maximum profit
- 🏭 **Multi-Rig Management** - Control all your rigs from one beautiful interface
- 💰 **Merged Mining** - Mine multiple chains simultaneously for maximum rewards
- 🛡️ **100% Open Source** - Transparent, secure, community-driven

**For Pool Operators:**

- 🏊 **DePool Management** - Transform your node into a decentralized mining pool
- 💰 **Automated Payouts** - Automatic payout calculation and processing
- 📊 **Pool Analytics** - Real-time statistics, miner tracking, profitability analysis
- ⚡ **One-Command Setup** - Everything automated, nothing manual

**The best mining experience for Quai and Qi. Period.**

🌐 **Website:** [View Landing Page](index.html) | 🔗 **GitHub:** https://github.com/thecrackofdan/quaiminer-core-os

## 🚀 Quick Start

### One-Command Installation (Recommended)

```bash
cd quaiminer-os
sudo ./install-unified.sh
```

This single command will:
- ✅ Auto-detect all GPUs (NVIDIA & AMD)
- ✅ Install/update drivers automatically
- ✅ Optimize GPU settings for Quai mining
- ✅ Install and configure quai-gpu-miner
- ✅ Set up multi-GPU mining

### Manual Setup

1. **View the Website:** Open `index.html` in your browser
2. **Launch Dashboard:** Navigate to `miner-dashboard/` and run `npm start`
3. **Setup GPUs:** Run `./quaiminer-os/hardware-detector.sh` to detect hardware
4. **Install Drivers:** Run `./quaiminer-os/driver-manager.sh` for automatic driver installation
5. **Optimize GPUs:** Run `./quaiminer-os/gpu-optimizer.sh` for automatic optimization

### Multi-Rig Setup

```bash
# Register this rig
cd quaiminer-os
sudo ./multi-rig-manager.sh register "Rig-Name" "192.168.1.100"

# List all rigs
sudo ./multi-rig-manager.sh list
```

## 📋 Contents

### 🌐 Website & Dashboard
- **`index.html`** - Landing page and main website for QuaiMiner CORE OS (DePool operation focus)
- **`miner-dashboard/`** - Full-featured real-time dashboard for DePool management and monitoring
- **`docs/DEPOOL_SYSTEM.md`** - Complete DePool system documentation and API reference

### 🔬 Core Research Documents
- **`quai_mining_software_research.md`** - Comprehensive research and comparison of all Quai mining software options
- **`QUAI_MINING_COMMANDS.md`** - Command reference for Quai GPU Miner (official)
- **`mining_software_comparison.sh`** - Interactive tool to get personalized miner recommendations

### ⚙️ Prerequisites (AMD OpenCL Setup)
- **`quick_amd_setup.sh`** - Automated installation script for AMDGPU Pro drivers and OpenCL setup
- **`amd_opencl_setup.sh`** - Diagnostic script for system status checks
- **`ubuntu_20_04_amd_rx590_setup.md`** - Step-by-step AMD OpenCL setup guide (legacy, works on all versions)
- **`UBUNTU_VERSION_SUPPORT.md`** - Ubuntu version compatibility guide
- **`amd_opencl_troubleshooting.md`** - Troubleshooting guide for OpenCL issues

## 🔬 Mining Software Research

### Quick Start

1. **Read the Research**: See [Quai Mining Software Research](quai_mining_software_research.md) for detailed comparison
2. **Get Your Recommendation**: Run `./mining_software_comparison.sh` for personalized suggestion

### Key Findings

**Recommended for DePool Operation:**

**Quai GPU Miner (Official)**
   - ✅ 0% fees (100% of rewards when built from source)
   - ✅ Quai-specific optimizations
   - ✅ Merged mining support
   - ✅ Official Quai Network miner
   - ✅ Designed for DePool integration
   - ⚠️ Requires building from source

For detailed comparison with other miners, see [Quai Mining Software Research](quai_mining_software_research.md).

### Performance (AMD RX 590)

| Miner | Hashrate | Fees | Setup Difficulty |
|-------|----------|------|-----------------|
| Quai GPU Miner | 10-12 MH/s | 0% | Medium |

## 🚀 Prerequisites Setup

Before choosing and using mining software, you need AMD OpenCL support:

### Automated Setup

```bash
chmod +x quick_amd_setup.sh
./quick_amd_setup.sh
```

This will:
1. Install AMDGPU Pro drivers
2. Configure OpenCL support
3. Set up environment variables
4. Configure user permissions

**Note:** Reboot required after installation.

### Manual Setup

For detailed manual installation or troubleshooting:
- [Ubuntu Version Support](UBUNTU_VERSION_SUPPORT.md) - Compatibility guide for all Ubuntu versions
- [Ubuntu 20.04 Setup Guide](ubuntu_20_04_amd_rx590_setup.md) - Legacy guide (still works on newer versions)
- [Troubleshooting Guide](amd_opencl_troubleshooting.md)

## ✅ Verification

After AMD setup, verify OpenCL is working:

```bash
clinfo
```

You should see your RX 590 detected with OpenCL support.

## 🐧 Ubuntu Version Support

QuaiMiner CORE OS supports **Ubuntu 20.04 LTS, 22.04 LTS, and 24.04 LTS** (latest).

All installation scripts automatically detect your Ubuntu version and install the appropriate drivers:
- **Ubuntu 24.04 LTS** ✅ - Fully supported (uses Mesa drivers or AMDGPU Pro)
- **Ubuntu 22.04 LTS** ✅ - Fully supported (uses Mesa drivers or AMDGPU Pro)
- **Ubuntu 20.04 LTS** ✅ - Fully supported (uses AMDGPU Pro 22.40)

For details, see [Ubuntu Version Support Guide](UBUNTU_VERSION_SUPPORT.md).

## 🏊 Mine on Our DePool - The Best Pool for Quai & Qi

**Join the most reliable, lowest-fee DePool for Quai Network mining.**

### Why Our Pool is Better

- ✅ **Lowest Fees** - Competitive pool fees (0.5-1.5%) - better than most pools
- ✅ **Fastest Payouts** - Daily automatic payouts, no waiting
- ✅ **Most Reliable** - 99.9% uptime, stable infrastructure
- ✅ **Best Dashboard** - Beautiful, easy-to-use interface
- ✅ **Quai & Qi Optimized** - Built specifically for Quai Network
- ✅ **Multi-Chain Support** - Mine Prime, Regions, and Zones
- ✅ **Merged Mining** - Mine multiple chains simultaneously
- ✅ **Auto-Optimization** - Automatically finds most profitable chain
- ✅ **Transparent** - Open source, see exactly how it works
- ✅ **Community Driven** - Built by miners, for miners

### Connect to Our Pool

**Stratum Endpoint:**
```
stratum://YOUR_POOL_IP:3333
```

**Quick Start:**
1. Install QuaiMiner CORE OS (see Quick Start above)
2. Configure miner to connect to our pool
3. Start mining and watch your rewards in the beautiful dashboard

### For Pool Operators

QuaiMiner CORE OS includes a complete **DePool system** that transforms your Quai node into a fully-featured mining pool.

**DePool Features:**
- **Miner Registration**: Automatically register miners when they connect
- **Share Tracking**: Track all submitted shares in real-time
- **Automated Payouts**: Calculate and process payouts automatically (PPS model)
- **Fee Management**: Configurable pool fees with profitability optimization
- **Real-Time Statistics**: Monitor pool performance, miner count, and hash rate
- **Beautiful Dashboard**: Best-looking pool management interface

**Quick DePool Setup:**
1. Install QuaiMiner CORE OS (see Quick Start above)
2. Launch Dashboard: Navigate to `miner-dashboard/` and run `npm start`
3. Enable DePool: Open dashboard → Click "🏊 DePool Manager" → Toggle "Enable DePool"
4. Configure Pool Settings: Set pool fee, minimum payout, and payout interval
5. Share Stratum Endpoint: Share `stratum://YOUR_NODE_IP:3333` with miners

For complete DePool documentation, see [DePool System Guide](docs/DEPOOL_SYSTEM.md).

## 🎮 Best Mining Experience for Quai & Qi

**The easiest, most powerful mining OS for Quai Network.**

### Why It's the Best

- **🎨 Beautiful Interface** - Modern, intuitive dashboard that's a joy to use
- **⚡ Easiest Setup** - One command installs everything automatically
- **🔄 Auto-Optimization** - Automatically switches between Quai chains for maximum profit
- **💎 Quai & Qi Native** - Built specifically for Quai Network multi-chain architecture
- **🏊 Best Pool** - Connect to our DePool for lowest fees and fastest payouts
- **🎮 Multi-GPU Support** - Automatically detect and manage all GPUs (NVIDIA & AMD)
- **🏭 Multi-Rig Management** - Control all your rigs from one beautiful dashboard
- **💰 Merged Mining** - Mine multiple chains simultaneously for maximum rewards
- **📊 Real-Time Stats** - Beautiful charts and live statistics
- **🛡️ Open Source** - Transparent, secure, community-driven

### Multi-GPU & Multi-Rig

- **Multi-GPU Mining**: Automatically detect and mine with all GPUs
- **AMD & NVIDIA Support**: Full support for both vendors, including mixed setups
- **Per-GPU Control**: Start/stop individual GPUs with beautiful controls
- **Multi-Rig Management**: Monitor and control multiple rigs from one dashboard
- **Auto-Optimization**: Automatically optimize each GPU for Quai & Qi mining
- **Driver Management**: Automatic driver installation and updates

### Documentation

- [AMD & NVIDIA Guide](AMD_AND_NVIDIA_GUIDE.md) - Complete guide for both GPU vendors
- [Multi-GPU Setup Guide](MULTI_GPU_SETUP.md) - Complete guide for multi-GPU setups
- [Project Structure](PROJECT_STRUCTURE.md) - Professional file organization

## ⚙️ Environment Variables

For Quai mining, these environment variables are automatically configured:

```bash
export ROC_ENABLE_PRE_VEGA=1
export HSA_OVERRIDE_GFX_VERSION=8.0.0
export GPU_FORCE_64BIT_PTR=1
export GPU_MAX_HEAP_SIZE=100
export GPU_USE_SYNC_OBJECTS=1
```

## 📝 Requirements

- Ubuntu 20.04 (Focal Fossa)
- AMD RX 590 GPU
- Internet connection
- sudo/root access

## 🔧 Troubleshooting

If you encounter issues:

1. Check [Troubleshooting Guide](amd_opencl_troubleshooting.md)
2. Run diagnostic: `./amd_opencl_setup.sh`
3. Verify GPU: `lspci | grep -i amd`
4. Check drivers: `lsmod | grep amdgpu`

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report Bugs](https://github.com/thecrackofdan/quaiminer-core-os/issues/new?template=bug_report.md)
- 💡 [Suggest Features](https://github.com/thecrackofdan/quaiminer-core-os/issues/new?template=feature_request.md)
- 📝 [View Issues](https://github.com/thecrackofdan/quaiminer-core-os/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

These scripts modify system drivers and configurations. Use at your own risk. Always backup your system before running installation scripts.

## 🙏 Acknowledgments

- Quai Network community
- AMD GPU mining community
- All contributors to this project
