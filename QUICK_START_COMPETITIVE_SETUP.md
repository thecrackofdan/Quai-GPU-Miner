# Quick Start: Competitive Setup for Quai & Qi Mining

## 🚀 Complete Setup in 5 Steps

### Step 1: Install QuaiMiner CORE OS
```bash
cd quaiminer-os
sudo ./install-unified.sh
```

### Step 2: Optimize GPUs for ProgPoW
```bash
# Run hardware detection first
sudo ./hardware-detector.sh

# Run ProgPoW-specific optimization
sudo ./progpow-gpu-optimizer.sh
```

This will:
- ✅ Optimize kernel parameters for ProgPoW
- ✅ Tune GPU memory clocks (critical for ProgPoW)
- ✅ Set optimal power limits
- ✅ Configure environment variables
- ✅ Apply GPU-specific optimizations

### Step 3: Start Dashboard
```bash
cd ../miner-dashboard
npm install  # First time only
npm start
```

Dashboard will be available at: `http://localhost:3000`

### Step 4: Configure Your Pool

**Option A: Connect to Our Pool (Recommended)**
1. Open dashboard
2. Navigate to "Mining Configuration"
3. Enter pool stratum: `stratum://YOUR_POOL_IP:3333`
4. Click "Start Mining"

**Option B: Run Your Own DePool**
1. Open dashboard
2. Click "🏊 DePool Manager"
3. Toggle "Enable DePool"
4. Configure pool settings:
   - Fee: 0.5-1.5% (competitive)
   - Minimum Payout: 0.1 QUAI
   - Payout Interval: 24 hours
5. Share stratum endpoint with miners

### Step 5: Enable SOAP Staking (Optional)
1. Open dashboard
2. Navigate to "Staking" section
3. Configure staking:
   - Select chain (Prime, Region, or Zone)
   - Enter amount to stake
   - Choose lockup period (7-365 days)
   - Click "Stake"

## 🎯 Competitive Advantages Enabled

### 1. ProgPoW Optimization ✅
- Kernel parameters tuned for memory bandwidth
- GPU memory clocks optimized
- Power limits set for efficiency
- Environment variables configured

### 2. Best Pool Experience ✅
- Lowest fees (0.5-1.5%)
- Fastest payouts (daily)
- Most reliable (99.9% uptime)
- Beautiful dashboard

### 3. SOAP Staking ✅
- Earn additional rewards
- Lockup period bonuses
- Auto-compounding available
- Integrated with mining

### 4. Mobile Support ✅
- PWA installed automatically
- Mobile dashboard available
- Push notifications ready
- Offline mode supported

## 📊 Testing Your Setup

### Run Comprehensive Tests
```bash
cd miner-dashboard
node test-system.js
```

This tests:
- ✅ Server health
- ✅ Database connection
- ✅ API endpoints
- ✅ DePool functionality
- ✅ SOAP staking
- ✅ Mobile/PWA
- ✅ GPU scripts

### Verify GPU Optimization
```bash
# Check optimization status
cat /etc/quaiminer/progpow-optimization.json

# Check GPU status
nvidia-smi  # For NVIDIA
rocm-smi    # For AMD
```

## 🔧 Fine-Tuning for Maximum Profit

### GPU-Specific Tuning

**AMD RX 590/580/570 (Polaris):**
- Memory Clock: 2000-2100 MHz (critical)
- Core Clock: 1400-1500 MHz (moderate)
- Power Limit: -10% to -20%

**NVIDIA RTX 3060/3070/3080:**
- Memory Clock: +500-1000 MHz
- Core Clock: -100-200 MHz
- Power Limit: 70-80%

### Kernel Optimization
Already applied by `progpow-gpu-optimizer.sh`:
- Shared memory: 64GB
- Swappiness: 10
- TCP buffers: Optimized
- File descriptors: Increased

## 📱 Mobile Access

### Install PWA
1. Open dashboard on mobile device
2. Browser will prompt to "Add to Home Screen"
3. Install for app-like experience

### Mobile Features
- Real-time monitoring
- Quick controls
- Push notifications
- Offline viewing

## 🏊 Pool Operator Setup

### Enable DePool
1. Dashboard → "🏊 DePool Manager"
2. Toggle "Enable DePool"
3. Configure:
   - Pool Fee: 0.5-1.5%
   - Min Payout: 0.1 QUAI
   - Payout Interval: 24 hours
4. Share endpoint: `stratum://YOUR_IP:3333`

### Monitor Pool
- Real-time statistics
- Miner tracking
- Profitability analysis
- Automated payouts

## 💰 SOAP Staking Setup

### Stake Tokens
1. Dashboard → "Staking"
2. Select chain
3. Enter amount
4. Choose lockup:
   - 7-30 days: 10% bonus
   - 30-90 days: 25% bonus
   - 90-180 days: 50% bonus
   - 180-365 days: 100% bonus

### Benefits
- Additional rewards on top of mining
- Higher APY for longer lockups
- Auto-compounding available
- Integrated with profit optimizer

## 🎨 Manager Dashboard Features

### Real-Time Monitoring
- Hash rate tracking
- GPU performance
- Temperature monitoring
- Share statistics

### Pool Management
- Miner registration
- Share tracking
- Payout processing
- Fee management

### Analytics
- Profitability analysis
- Revenue tracking
- Cost calculations
- Profit margins

## ✅ Verification Checklist

- [ ] GPUs detected and optimized
- [ ] ProgPoW optimization applied
- [ ] Dashboard running
- [ ] Pool configured (or DePool enabled)
- [ ] Mining started
- [ ] Mobile/PWA accessible
- [ ] Staking configured (optional)
- [ ] Tests passing

## 🚨 Troubleshooting

### GPU Not Optimized
```bash
# Re-run optimizer
sudo ./progpow-gpu-optimizer.sh

# Check logs
tail -f /var/log/quaiminer/progpow-optimizer.log
```

### Dashboard Not Starting
```bash
# Check Node.js
node --version  # Should be 14+

# Check dependencies
cd miner-dashboard
npm install

# Check port
lsof -i :3000  # Should be free
```

### Mining Not Starting
```bash
# Check miner service
sudo systemctl status quaiminer

# Check logs
sudo journalctl -u quaiminer -f

# Check configuration
cat /etc/quaiminer/config.json
```

## 📈 Performance Expectations

### AMD RX 590
- Hash Rate: 10-12 MH/s (ProgPoW optimized)
- Power: 150-180W
- Temperature: 65-75°C

### NVIDIA RTX 3060
- Hash Rate: 15-18 MH/s (ProgPoW optimized)
- Power: 120-140W
- Temperature: 60-70°C

## 🎯 Competitive Edge

With this setup, you have:
- ✅ Best GPU optimization for ProgPoW
- ✅ Lowest pool fees
- ✅ Fastest payouts
- ✅ SOAP staking integration
- ✅ Beautiful mobile interface
- ✅ Complete manager dashboard
- ✅ Automated optimization

**You're ready to compete!** 🚀

