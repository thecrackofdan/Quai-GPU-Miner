# Pool Mining & GPU Fine-Tuning Features

## Overview

QuaiMiner CORE OS now includes comprehensive **pool mining support** and **GPU fine-tuning capabilities** to give users full control over their mining operations.

## ✅ Pool Mining Features

### Pool Selection Interface

1. **Pool Comparison Page** (`/pools.html`)
   - Side-by-side comparison of all pools
   - Fee comparison table
   - Detailed pool information
   - One-click pool selection

2. **Integrated Pool Selector**
   - Available in Miner Configuration modal
   - Dropdown with all available pools
   - Real-time pool information display
   - Custom pool option

3. **Pool Recommendations**
   - Automatic recommendations based on hash rate
   - Smart suggestions for optimal earnings
   - Fee impact calculations

### Available Pools

| Pool | Fee | Payout | Min Payout | URL |
|------|-----|--------|------------|-----|
| **Solo (Your Node)** | 0% | When block found | Block reward | `stratum://localhost:3333` |
| **Quai Network Official** | 0.5% | Daily | 0.1 QUAI | `stratum+tcp://pool.quai.network:3333` |
| **QuaiMiner Pool** | 1.0% | Daily | 0.05 QUAI | `stratum+tcp://pool.quaiminer.io:3333` |
| **QuaiHash Pool** | 1.5% | Weekly | 0.2 QUAI | `stratum+tcp://pool.quaihash.com:3333` |

### Pool Information Displayed

- **Fee**: Percentage and effective cost
- **Mining**: What chains are mined
- **Payout**: Frequency and schedule
- **Min Payout**: Minimum withdrawal amount
- **Uptime**: Pool reliability
- **Features**: Key benefits
- **Requirements**: What's needed

### Pool Switching

Users can switch between pools anytime:
1. Open Miner Configuration
2. Select "Pool Mining" mode
3. Choose pool from dropdown
4. Enter wallet address
5. Save and start mining

## ✅ GPU Fine-Tuning Features

### Fine-Tuning Interface

1. **GPU Tuner Page** (`/gpu-tuner.html`)
   - Individual GPU tuning cards
   - Real-time impact preview
   - Optimal settings display
   - Preset management

2. **Quick Access Button**
   - "Fine-Tune GPUs" button in GPU section
   - Direct access to tuning interface
   - Per-GPU configuration

### Tunable Settings

For each GPU:
- **Core Clock** (MHz): GPU core frequency
- **Memory Clock** (MHz): Memory frequency  
- **Power Limit** (%): Power consumption limit
- **Fan Speed** (%): Cooling fan speed
- **Voltage** (mV): GPU voltage (advanced)
- **Intensity** (0-30): Mining intensity

### Features

1. **Optimal Settings Display**
   - Shows auto-detected optimal values
   - Compares with current settings
   - Highlights differences

2. **Impact Estimation**
   - Real-time hash rate impact
   - Power consumption change
   - Efficiency calculation
   - Recommendations

3. **Test Mode**
   - Apply settings temporarily (60s)
   - Monitor performance
   - Revert automatically
   - Safe testing

4. **Preset Management**
   - Save successful configurations
   - Load presets quickly
   - Share between GPUs
   - Named presets

5. **Reset to Optimal**
   - One-click reset
   - Restores auto-detected settings
   - Safe fallback

### GPU-Specific Optimizations

The tuner includes optimal settings for:
- **AMD RX 590**: 1545/2000 MHz, -20% power
- **AMD RX 580/570**: 1450/2000 MHz, -15% power
- **AMD RX 6000 series**: Optimized for RDNA 2
- **AMD RX 7000 series**: Optimized for RDNA 3
- **NVIDIA RTX 30 series**: Memory overclock focus
- **NVIDIA RTX 40 series**: Efficiency optimized
- **NVIDIA GTX 10/16 series**: Balanced settings

## API Endpoints

### Pool Management
- `GET /api/pools` - List all available pools
- `GET /api/pools/recommended?hashRate=X` - Get recommended pool
- Pool selection integrated into `/api/miner/config`

### GPU Fine-Tuning
- `GET /api/gpu/list` - Get all GPUs with settings
- `GET /api/gpu/:id/settings` - Get GPU settings
- `POST /api/gpu/:id/settings` - Apply GPU settings
- `POST /api/gpu/:id/reset` - Reset to optimal
- `GET /api/gpu/presets` - Get saved presets
- `POST /api/gpu/presets` - Save preset

## User Workflow

### Setting Up Pool Mining

1. **Access Pool Selection**
   - Click "Pools" badge in header
   - Or open Miner Configuration → Select "Pool Mining"

2. **Choose Pool**
   - Review pool comparison
   - See fees and features
   - Select recommended or custom

3. **Configure**
   - Enter wallet address
   - Set worker name (optional)
   - Save configuration

4. **Start Mining**
   - Miner connects to pool
   - Monitor share acceptance
   - Track earnings

### Fine-Tuning GPUs

1. **Access Tuner**
   - Click "Fine-Tune GPUs" in GPU section
   - Or visit `/gpu-tuner.html`

2. **Review Current Settings**
   - See auto-detected optimal
   - Compare with current values
   - Understand baseline

3. **Adjust Settings**
   - Use sliders or enter values
   - See impact estimates
   - Test before applying

4. **Apply or Test**
   - Test for 60 seconds
   - Monitor performance
   - Apply if satisfied

5. **Save Preset** (optional)
   - Save successful config
   - Load later if needed

## Integration Points

### Dashboard Integration
- Pool selection in Miner Config modal
- GPU tuning button in GPU section
- Pool badge in header
- Mining mode indicator

### Backend Integration
- Pool API endpoints
- GPU settings API
- Configuration persistence
- Miner API integration

## Documentation

- **Pool Guide**: `docs/POOLS_GUIDE.md`
- **Combined Guide**: `docs/POOL_AND_TUNING_GUIDE.md`
- **Pool Selection Page**: `/pools.html`
- **GPU Tuner Page**: `/gpu-tuner.html`

## Benefits

### For Users Without Nodes
- ✅ Easy pool setup
- ✅ No node required
- ✅ Steady payouts
- ✅ Multiple pool options

### For Advanced Users
- ✅ Full GPU control
- ✅ Fine-tune for efficiency
- ✅ Test before committing
- ✅ Save working presets

### For All Users
- ✅ Clear fee information
- ✅ Pool recommendations
- ✅ Easy switching
- ✅ Optimal defaults with override option

