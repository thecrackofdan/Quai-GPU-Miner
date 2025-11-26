# Automation Guide - Zero-Configuration Mining

## Overview

QuaiMiner CORE OS is designed for maximum automation, making it easy for both new and experienced users to start mining with minimal configuration.

## 🆕 For New Users

### One-Click Mining Start

**The Simplest Way:**
1. Open dashboard
2. Click "🚀 Start Mining" button
3. Done! System automatically:
   - Detects your hardware
   - Optimizes settings
   - Configures mining
   - Starts mining

### Automatic Setup Wizard

**First Time Users:**
- Welcome modal appears automatically
- Click "✨ Auto-Setup (Recommended)"
- System detects hardware
- Applies optimal settings
- Starts mining automatically

**What Gets Configured:**
- ✅ GPU detection and optimization
- ✅ Mining mode (solo or pool)
- ✅ Optimal power/clocks for your GPUs
- ✅ Merged mining (if multiple GPUs)
- ✅ Basic alerts
- ✅ Dashboard configuration

### Automated Installation

**For Fresh OS Install:**
```bash
# Run automated installer
cd quaiminer-os
chmod +x auto-install.sh
sudo ./auto-install.sh
```

**What It Does:**
1. Detects GPUs (NVIDIA/AMD)
2. Installs drivers automatically
3. Installs Quai GPU Miner
4. Auto-configures optimal settings
5. Enables and starts services
6. Ready to mine!

## 👨‍💻 For Experienced Users

### Quick Start Mode

**No Prompts, Smart Defaults:**
- System uses existing configuration
- Or applies smart defaults based on hardware
- Minimal interaction required
- Full control available when needed

### Advanced Mode Toggle

**Access Advanced Features:**
- All automation features can be disabled
- Manual configuration available
- Custom scripts supported
- Full API access

### Smart Defaults

**Hardware-Specific Optimization:**
- AMD RX 590: Auto-optimized settings
- NVIDIA RTX 30/40: Auto-optimized settings
- Multi-GPU: Auto-merged mining config
- Single GPU: Conservative settings

## 🤖 Automation Features

### 1. Hardware Auto-Detection
- ✅ GPU detection (NVIDIA/AMD)
- ✅ GPU count detection
- ✅ Model identification
- ✅ Vendor detection
- ✅ Optimal settings lookup

### 2. Smart Configuration
- ✅ Mining mode selection (solo vs pool)
- ✅ Node detection and configuration
- ✅ Pool selection (if no node)
- ✅ GPU optimization per model
- ✅ Merged mining auto-config

### 3. Auto-Optimization
- ✅ Power limits based on GPU
- ✅ Clock speeds optimized
- ✅ Fan curves set
- ✅ Intensity tuned
- ✅ Worksize configured

### 4. Auto-Start
- ✅ Mining starts automatically
- ✅ Services auto-enabled
- ✅ Dashboard auto-starts
- ✅ Watchdog enabled

### 5. Auto-Recovery
- ✅ Auto-reboot on crashes
- ✅ Auto-restart miner
- ✅ Temperature monitoring
- ✅ Health checks

## 📋 Automation Levels

### Level 1: Full Auto (New Users)
- Zero configuration
- Hardware detection
- Smart defaults
- One-click start
- Guided setup

### Level 2: Smart Auto (Intermediate)
- Existing config respected
- Smart suggestions
- Quick optimizations
- Manual overrides available

### Level 3: Manual (Advanced)
- Full control
- Custom configurations
- Scripting enabled
- Advanced features

## 🎯 Use Cases

### Use Case 1: First-Time User
1. Boot OS
2. Open dashboard
3. Click "Start Mining"
4. Enter wallet (optional)
5. Mining starts automatically

### Use Case 2: Adding New GPU
1. Install GPU
2. Reboot
3. System auto-detects
4. Auto-optimizes settings
5. Mining continues

### Use Case 3: Switching Modes
1. Open dashboard
2. Click "Profiles"
3. Select profile
4. Click "Apply"
5. System restarts with new config

### Use Case 4: Remote Setup
1. SSH into rig
2. Run auto-install script
3. System configures everything
4. Access dashboard remotely
5. Start mining

## 🔧 Configuration Automation

### Auto-Detected Settings

**Based on Hardware:**
- GPU vendor → Driver selection
- GPU model → Optimal clocks
- GPU count → Merged mining config
- Hash rate → Mining mode suggestion

**Based on Environment:**
- Node available → Solo mining
- No node → Pool mining
- Network speed → Pool selection
- Power availability → Power limits

### Smart Recommendations

**System Suggests:**
- Best mining mode for your setup
- Optimal pool (if pool mining)
- Recommended GPU settings
- Merged mining configuration
- Alert thresholds

## 📊 Automation Status

| Feature | New Users | Experienced | Status |
|---------|-----------|-------------|--------|
| **Hardware Detection** | ✅ Auto | ✅ Auto | Complete |
| **Driver Installation** | ✅ Auto | ⚠️ Manual | Complete |
| **Miner Installation** | ✅ Auto | ⚠️ Manual | Complete |
| **Configuration** | ✅ Auto | ⚠️ Manual | Complete |
| **Optimization** | ✅ Auto | ⚠️ Manual | Complete |
| **Mining Start** | ✅ One-Click | ✅ One-Click | Complete |
| **Auto-Recovery** | ✅ Enabled | ✅ Enabled | Complete |
| **Alerts** | ✅ Basic | ✅ Advanced | Complete |

## 🚀 Quick Start Commands

### New User (Full Auto)
```bash
# Install everything automatically
sudo ./auto-install.sh

# Or just start dashboard and click "Start Mining"
npm start
```

### Experienced User (Quick)
```bash
# Quick start with existing config
# Just start mining - uses existing settings
curl -X POST http://localhost:3000/api/miner/start
```

## 💡 Tips

1. **First Time**: Let auto-setup run - it's optimized for your hardware
2. **Customization**: All auto-settings can be changed later
3. **Profiles**: Create profiles for different scenarios
4. **Watchdog**: Keep auto-reboot enabled for stability
5. **Alerts**: Set up alerts for peace of mind

## 🎉 Result

With full automation, users can:
- ✅ Start mining in under 5 minutes
- ✅ Zero technical knowledge required
- ✅ Optimal settings automatically
- ✅ Full control when needed
- ✅ Professional-grade automation

**QuaiMiner CORE OS makes mining accessible to everyone while providing advanced features for power users!**

