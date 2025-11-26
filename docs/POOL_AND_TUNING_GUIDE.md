# Pool Mining & GPU Fine-Tuning Guide

## Overview

QuaiMiner CORE OS supports both **pool mining** and **solo mining**, plus advanced **GPU fine-tuning** capabilities.

## Pool Mining

### Why Use a Pool?

- ✅ **Steady payouts** (daily/weekly)
- ✅ **No node required** (easier setup)
- ✅ **Lower variance** (more predictable)
- ✅ **Good for small-medium miners**

### Available Pools

| Pool | Fee | Payout | Min Payout | Best For |
|------|-----|--------|------------|----------|
| **Solo (Your Node)** | 0% | When block found | Block reward | Large miners (>200 MH/s) |
| **Quai Network Official** | 0.5% | Daily | 0.1 QUAI | All miners |
| **QuaiMiner Pool** | 1.0% | Daily | 0.05 QUAI | Small miners (<50 MH/s) |
| **QuaiHash Pool** | 1.5% | Weekly | 0.2 QUAI | Alternative |

### Selecting a Pool

1. **Access Pool Selection:**
   - Dashboard → Settings → Miner Configuration
   - Or visit `/pools.html` for detailed comparison

2. **Choose Mining Mode:**
   - **Solo**: Your own node (0% fee, 100% rewards)
   - **Pool**: Shared mining (small fee, regular payouts)

3. **Enter Pool Details:**
   - Pool URL (e.g., `stratum+tcp://pool.quai.network:3333`)
   - Wallet address
   - Worker name (optional)

4. **Save and Start:**
   - Settings are saved automatically
   - Miner will connect to selected pool

### Pool Recommendations by Hash Rate

- **< 20 MH/s**: QuaiMiner Pool (1% fee, low minimum)
- **20-100 MH/s**: Quai Network Official (0.5% fee)
- **> 100 MH/s**: Solo Mining (0% fee, best returns)

## GPU Fine-Tuning

### Overview

While the OS auto-detects and applies optimal settings, you can fine-tune for:
- Maximum hash rate
- Better efficiency
- Lower power consumption
- Temperature control

### Accessing GPU Tuner

1. **From Dashboard:**
   - Click "Fine-Tune GPUs" button in GPU section
   - Or visit `/gpu-tuner.html`

2. **Available Settings:**
   - **Core Clock**: GPU core frequency (MHz)
   - **Memory Clock**: Memory frequency (MHz)
   - **Power Limit**: Power consumption limit (%)
   - **Fan Speed**: Cooling fan speed (%)
   - **Voltage**: GPU voltage (mV)
   - **Intensity**: Mining intensity (0-30)

### Fine-Tuning Process

1. **View Current Settings:**
   - See auto-detected optimal values
   - Compare with current applied settings

2. **Adjust Settings:**
   - Use sliders or enter values directly
   - See real-time impact estimates

3. **Test Settings:**
   - Click "Test (60s)" to try temporarily
   - Monitor performance during test

4. **Apply Permanently:**
   - Click "Apply Settings" when satisfied
   - Settings saved and applied immediately

5. **Save as Preset:**
   - Save successful configurations
   - Load later for quick switching

### GPU-Specific Optimal Settings

#### AMD RX 590
- Core Clock: 1545 MHz
- Memory Clock: 2000 MHz
- Power Limit: -20%
- Fan Speed: 60%

#### AMD RX 580/570
- Core Clock: 1450 MHz
- Memory Clock: 2000 MHz
- Power Limit: -15%
- Fan Speed: 65%

#### NVIDIA RTX 3060/3070/3080
- Core Clock: 0 (base)
- Memory Clock: +1000 MHz
- Power Limit: 70%
- Fan Speed: 70%

#### NVIDIA RTX 4060/4070/4080
- Core Clock: -200 MHz
- Memory Clock: +1500 MHz
- Power Limit: 75%
- Fan Speed: 65%

### Fine-Tuning Tips

1. **Start Conservative:**
   - Make small adjustments first
   - Test each change

2. **Monitor Temperature:**
   - Keep GPU temp < 80°C
   - Adjust fan speed if needed

3. **Balance Performance:**
   - Higher hash rate = more power
   - Find efficiency sweet spot

4. **Test Before Committing:**
   - Use "Test" button first
   - Monitor for stability

5. **Save Working Presets:**
   - Save successful configurations
   - Easy to revert if needed

### Impact Estimation

The tuner shows estimated impact:
- **Hash Rate Change**: Expected MH/s difference
- **Power Change**: Power consumption change
- **Efficiency**: MH/s per Watt

**Good Settings:**
- ✅ Positive efficiency change
- ✅ Hash rate increase
- ✅ Reasonable power increase

**Warning Signs:**
- ⚠️ Significant hash rate loss
- ⚠️ High power increase (>20%)
- ⚠️ Temperature issues

### Resetting to Optimal

If settings cause issues:
1. Click "Reset to Optimal"
2. Settings revert to auto-detected values
3. Miner continues with safe defaults

### Command Line Tuning

For advanced users:

```bash
# Apply custom settings
sudo /opt/quaiminer/gpu-tuner.sh apply 0 1545 2000 -20 60

# Get optimal settings
sudo /opt/quaiminer/gpu-tuner.sh optimal 0 "RX 590" "AMD"

# Reset to optimal
sudo /opt/quaiminer/gpu-tuner.sh reset 0 "RX 590" "AMD"
```

## Best Practices

### Pool Mining
- ✅ Choose pool with low fee
- ✅ Monitor reject rate (<1%)
- ✅ Use worker names for tracking
- ✅ Check pool uptime regularly

### GPU Tuning
- ✅ Start with auto-detected settings
- ✅ Make incremental changes
- ✅ Test before applying
- ✅ Monitor temperature and stability
- ✅ Save working presets

## Troubleshooting

### Pool Issues
- **High reject rate**: Check network latency, verify pool URL
- **No shares**: Verify wallet address, check pool status
- **Low earnings**: Compare to pool average, verify hash rate

### GPU Tuning Issues
- **Settings not applying**: Check GPU vendor, verify permissions
- **Instability**: Reset to optimal, reduce overclock
- **High temperature**: Increase fan speed, reduce power limit

## Resources

- **Pool Guide**: `/docs/POOLS_GUIDE.md`
- **Pool Selection**: `/pools.html`
- **GPU Tuner**: `/gpu-tuner.html`
- **Hardware Detection**: Run `hardware-detector.sh`

