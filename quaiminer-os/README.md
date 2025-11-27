# QuaiMiner OS - Custom Mining OS for DePool Operation

**Custom mining operating system for developers operating a DePool on Quai Network**

QuaiMiner OS is a complete mining management system designed for developers who want to operate a decentralized pool (DePool) on Quai Network. Transform your Quai node into a fully-featured mining pool with automated miner management, payout processing, and profitability optimization.

## 🎯 What It Does

- ✅ **DePool Operation**: Transform your node into a decentralized mining pool
- ✅ **Automated Miner Installation**: Installs and configures quai-gpu-miner automatically
- ✅ **Miner Management**: Automatically register and track connected miners
- ✅ **Share Tracking**: Track all submitted shares (accepted/rejected) in real-time
- ✅ **Automated Payouts**: Calculate and process miner payouts automatically (PPS model)
- ✅ **Fee Management**: Configurable pool fees with profitability optimization
- ✅ **Stratum Integration**: Full stratum protocol support for miner connections
- ✅ **Auto-Start Mining**: Automatically starts mining on boot
- ✅ **Remote Management**: Control your DePool from anywhere via web dashboard
- ✅ **Real-Time Monitoring**: Monitor pool statistics, miner performance, and profitability
- ✅ **Multi-Rig Support**: Manage multiple mining rigs connected to your DePool

## 🚀 Quick Start

### Prerequisites
1. **Install AMD/NVIDIA Drivers** (one-time setup)
   - **For AMD RX 590**: Run `./amd-setup-integration.sh` (integrated from quick_amd_setup.sh)
   - **For other AMD GPUs**: Run `../quick_amd_setup.sh` or `./amd-setup-integration.sh`
   - **For NVIDIA**: Install NVIDIA drivers

2. **Install QuaiMiner OS**
   ```bash
   cd quaiminer-os
   chmod +x install.sh
   sudo ./install.sh
   ```

3. **Enable and Configure DePool**
   - Ensure your Quai node is running and synced
   - Start your node's stratum proxy (usually on localhost:3333)
   - Open dashboard: `http://localhost:3000`
   - Navigate to "🏊 DePool Manager"
   - Toggle "Enable DePool" switch
   - Configure pool settings:
     - **Pool Fee**: 0.5-2.0% (recommended)
     - **Minimum Payout**: 0.1 QUAI (recommended)
     - **Payout Interval**: 24 hours (recommended)
   - Click "Save Configuration"
   - Share your stratum endpoint with miners: `stratum://YOUR_NODE_IP:3333`

That's it! Your DePool is now operational. Miners can connect and start mining, and payouts will be processed automatically.

## 📋 Components

### 1. Automated Installation (`install.sh`)
- Installs quai-gpu-miner from source or pre-built binaries
- Sets up systemd service for auto-start
- Configures environment variables
- Creates configuration directory

### 2. Miner Service (`quaiminer.service`)
- Systemd service for automatic startup
- Handles miner process management
- Auto-restart on failure
- Logs to systemd journal

### 3. Configuration Manager (`config-manager.sh`)
- Manages pool/stratum configuration
- Updates miner config files
- Validates connection strings
- Restarts miner when config changes

### 4. Web Dashboard Integration
- Pool/stratum configuration interface
- Start/stop/restart miner controls
- Real-time status monitoring
- Configuration history

### 5. API Endpoints (`server.js`)
- `/api/miner/start` - Start mining
- `/api/miner/stop` - Stop mining
- `/api/miner/status` - Get miner status
- `/api/miner/config` - Get/set configuration
- `/api/pools/list` - List configured pools

## 🎮 AMD RX 590 Support

QuaiMiner OS includes **specialized support for AMD RX 590** with:
- ✅ Automated driver installation
- ✅ RX 590-specific environment variables
- ✅ GPU optimization profiles
- ✅ Verification and tuning tools

### Quick AMD RX 590 Setup

```bash
# Run AMD setup integration (includes driver installation)
cd quaiminer-os
sudo ./amd-setup-integration.sh

# Apply RX 590 optimizations
sudo ./rx590-optimization.sh

# Verify setup
quaiminer-verify-amd
```

### RX 590 Optimization

Expected performance with optimizations:
- **Hashrate**: 10-12 MH/s
- **Power**: 150-180W
- **Temperature**: 65-75°C (optimal)

See `/etc/quaiminer/rx590-optimization.md` for detailed tuning guide.

## 🔧 Configuration

### DePool Configuration

**DePool Operation:**
```
# Enable DePool mode in dashboard
1. Open dashboard → "🏊 DePool Manager"
2. Toggle "Enable DePool"
3. Configure pool settings:
   - Pool Fee: 0.5-2.0% (recommended)
   - Minimum Payout: 0.1 QUAI
   - Payout Interval: 24 hours
4. Save configuration

# Share stratum endpoint with miners
stratum://YOUR_NODE_IP:3333
stratum://pool.yourdomain.com:3333
```

**Stratum Proxy Configuration:**
```
# Local node (for DePool operation)
stratum://localhost:3333
stratum://127.0.0.1:3333

# Remote node (if node is on another machine)
stratum://192.168.1.100:3333
stratum://your-node-ip:3333
```

**Note:** This system is designed for DePool operation. Your Quai node's stratum proxy accepts miner connections and the DePool system manages payouts, fees, and statistics.

### Environment Variables

**Automatically configured by install script:**
- `ROC_ENABLE_PRE_VEGA=1` (for AMD Polaris cards like RX 590)
- `HSA_OVERRIDE_GFX_VERSION=8.0.0` (for RX 590)
- `GPU_FORCE_64BIT_PTR=1`
- `GPU_MAX_HEAP_SIZE=100`
- `GPU_USE_SYNC_OBJECTS=1`
- `GPU_MAX_ALLOC_PERCENT=100`
- `GPU_SINGLE_ALLOC_PERCENT=100`

**For AMD RX 590:**
These are automatically set when RX 590 is detected. See `/etc/quaiminer/environment` for the complete list.

## 📊 Dashboard Features

- **DePool Management**: Complete DePool control panel with enable/disable toggle
- **Pool Statistics**: Real-time pool statistics (miners, hash rate, blocks found, revenue)
- **Miner Management**: View all connected miners, their hash rates, shares, and pending balances
- **Payout Processing**: Automated payout calculation and processing
- **Profitability Analysis**: Track pool operator revenue, costs, and profit margins
- **Fee Optimization**: AI-powered fee optimization for maximum profitability
- **Mining Status**: Real-time hashrate, shares, temperature for your own mining rigs
- **Node Integration**: Connect to your own Quai node's stratum proxy
- **Miner Controls**: Start, stop, restart with one click
- **Logs Viewer**: View miner output in real-time
- **Multi-Rig Management**: Manage multiple miners connected to your DePool

## 🔄 Auto-Start on Boot

The miner automatically starts on system boot via systemd service:
```bash
# Check status
sudo systemctl status quaiminer

# Enable auto-start
sudo systemctl enable quaiminer

# Start now
sudo systemctl start quaiminer
```

## 🌐 Remote Management

Access your mining rig from anywhere:
1. Set up port forwarding (optional)
2. Access dashboard: `http://your-rig-ip:3000`
3. Configure and control mining remotely

## 🛠️ Troubleshooting

### Miner Not Starting
```bash
# Check service status
sudo systemctl status quaiminer

# View logs
sudo journalctl -u quaiminer -f

# Check configuration
cat /etc/quaiminer/config.json
```

### Pool Connection Issues
- Verify pool/stratum address format
- Check network connectivity
- Verify firewall rules
- Check miner logs for connection errors

## 📝 Next Steps

1. Install QuaiMiner OS
2. Configure your pool/stratum address
3. Start mining
4. Monitor via dashboard

For detailed documentation, see:
- [Installation Guide](INSTALL.md)
- [Configuration Guide](CONFIG.md)
- [API Documentation](API.md)

