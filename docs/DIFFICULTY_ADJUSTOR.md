# Difficulty Adjustor - Complete Guide

## Overview

The Difficulty Adjustor is an automated system that monitors all Quai Network chains and automatically switches to the chain with the **lowest difficulty** for maximum block discovery and mining profits. This is especially useful when the blockchain scales and difficulty varies significantly across different chains.

## Why Difficulty Matters

**Lower Difficulty = Easier Block Discovery = More Frequent Rewards**

When blockchain scales:
- Different chains may have vastly different difficulty levels
- Lower difficulty chains are easier to mine, leading to more blocks found
- More blocks = more frequent rewards = better profitability
- The adjustor automatically finds and mines the easiest chain

## Features

### 1. Automatic Chain Selection
- Monitors difficulty across all available chains
- Automatically identifies the chain with lowest difficulty
- Switches mining to the lowest difficulty chain
- Updates in real-time as difficulty changes

### 2. Difficulty Tracking
- Tracks difficulty history for all chains
- Maintains last 100 difficulty readings per chain
- Shows difficulty trends over time
- Helps predict which chains will be easiest to mine

### 3. Expected Rewards Calculation
- Calculates expected rewards based on difficulty
- Factors in block reward, network hash rate, and block time
- Adjusts for difficulty factor (lower difficulty = higher rewards)
- Shows estimated daily rewards per chain

### 4. Smart Switching
- Only switches when a lower difficulty chain is found
- Prevents unnecessary switching
- Logs all chain switches with timestamps
- Shows switch history in UI

## How It Works

### 1. Difficulty Monitoring
```
Every 60 seconds (configurable):
  1. Fetch difficulty for all enabled chains
  2. Compare difficulties
  3. Find chain with lowest difficulty
  4. Switch if different from current chain
```

### 2. Difficulty Calculation
```
Expected Rewards = Network Share × Blocks Per Day × Block Reward × Difficulty Factor

Where:
- Network Share = User Hash Rate / Network Hash Rate
- Blocks Per Day = 86400 / Block Time
- Difficulty Factor = 1 / (1 + Difficulty / Base Difficulty)
```

### 3. Chain Selection Logic
```
1. Filter chains above minimum difficulty threshold
2. Sort by difficulty (lowest first)
3. Select chain with absolute lowest difficulty
4. Switch immediately (no threshold needed)
```

## Usage

### Enabling the Difficulty Adjustor

1. **Dashboard Widget**:
   - Find "⚡ Difficulty Adjustor" widget
   - Toggle "Enable Auto-Adjustment" checkbox
   - Widget will start monitoring immediately

2. **Settings**:
   - Check interval: How often to check difficulty (default: 60 seconds)
   - Minimum difficulty threshold: Ignore chains below this (default: 0)

### Viewing Difficulty Comparison

The widget displays:
- **Current Target**: Chain currently being mined (lowest difficulty)
- **Difficulty List**: All chains sorted by difficulty (lowest first)
- **Estimated Rewards**: Expected daily rewards per chain
- **Block Time**: Average time between blocks

### Chain Information Display

Each chain shows:
- Chain name and token
- Current difficulty (formatted with commas)
- Estimated daily rewards
- Block time
- Visual indicator for lowest difficulty chain

## Configuration

### API Endpoints

#### Get Settings
```http
GET /api/difficulty-adjustor/settings
```

Response:
```json
{
  "success": true,
  "settings": {
    "enabled": false,
    "checkInterval": 60000,
    "minDifficultyThreshold": 0
  }
}
```

#### Update Settings
```http
POST /api/difficulty-adjustor/settings
Content-Type: application/json

{
  "enabled": true,
  "checkInterval": 60000,
  "minDifficultyThreshold": 0
}
```

### Settings Parameters

- **enabled**: Enable/disable auto-adjustment (boolean)
- **checkInterval**: How often to check difficulty in milliseconds (default: 60000 = 1 minute)
- **minDifficultyThreshold**: Minimum difficulty to consider (default: 0 = all chains)

## Integration with Other Features

### Profit Optimizer
- **Different Focus**: Profit optimizer considers rewards + staking, difficulty adjustor focuses purely on difficulty
- **Can Run Together**: Both can be enabled simultaneously
- **Priority**: If both enabled, they may conflict - consider using one at a time

### Staking
- **Independent**: Difficulty adjustor doesn't consider staking rewards
- **Combined Strategy**: Use profit optimizer for staking-aware selection, difficulty adjustor for pure difficulty-based selection

### Merged Mining
- **Compatible**: Works with merged mining configuration
- **Auto-Switching**: Automatically updates merged mining config when switching chains

## Best Practices

### 1. When to Use Difficulty Adjustor

**Use Difficulty Adjustor when:**
- Blockchain is scaling rapidly
- Difficulty varies significantly across chains
- You want maximum block discovery frequency
- You prefer simpler, difficulty-based selection

**Use Profit Optimizer when:**
- You have staking positions
- You want to consider total rewards (mining + staking)
- You want more sophisticated profitability calculations

### 2. Monitoring

- **Check Widget Regularly**: Monitor which chain is being targeted
- **Review Switch History**: See how often chains are switching
- **Watch Difficulty Trends**: Observe difficulty changes over time

### 3. Optimization

- **Adjust Check Interval**: More frequent checks = faster response, but more API calls
- **Set Minimum Threshold**: Filter out chains with too low difficulty
- **Enable Relevant Chains**: Only enable chains you want to mine

## Technical Details

### Difficulty Factor Calculation

The difficulty factor adjusts expected rewards based on difficulty:

```javascript
difficultyFactor = 1 / (1 + (difficulty / baseDifficulty))

Where baseDifficulty = 1,000,000 (normalization constant)
```

**Example:**
- Difficulty 500,000 → Factor ~0.67 (easier)
- Difficulty 1,000,000 → Factor ~0.50 (medium)
- Difficulty 2,000,000 → Factor ~0.33 (harder)

### Chain Switching

When switching chains:
1. Updates merged mining configuration
2. Sets new chain as target
3. Logs switch with timestamp and reason
4. Restarts miner to apply changes
5. Updates UI to show new target

### Difficulty History

Maintains history for:
- Last 100 difficulty readings per chain
- Timestamp for each reading
- Used for trend analysis
- Helps predict future difficulty

## Troubleshooting

### Adjustor Not Switching

**Possible Causes:**
- All chains have similar difficulty
- Minimum threshold too high
- Chains not enabled
- API errors fetching difficulty

**Solutions:**
- Check difficulty values in widget
- Lower minimum threshold
- Enable more chains
- Check network connectivity

### Frequent Switching

**Possible Causes:**
- Difficulty values very close
- Network instability
- Check interval too short

**Solutions:**
- Increase check interval
- Add switch cooldown (future feature)
- Check network stability

### No Chains Showing

**Possible Causes:**
- No chains enabled
- All chains below minimum threshold
- API errors

**Solutions:**
- Enable chains in configuration
- Lower minimum threshold
- Check API connectivity

## Future Enhancements

1. **Switch Cooldown**: Prevent too-frequent switching
2. **Difficulty Prediction**: Predict future difficulty based on history
3. **Multi-Chain Mining**: Mine multiple low-difficulty chains simultaneously
4. **Difficulty Alerts**: Notify when difficulty changes significantly
5. **Historical Charts**: Visualize difficulty trends over time

## API Integration

The difficulty adjustor uses:
- `/api/chain/metrics` - Fetch difficulty for chains
- `/api/miner/config` - Update mining configuration
- `/api/miner/restart` - Restart miner after switching

## Status

✅ **Fully Implemented and Integrated**

The difficulty adjustor is production-ready and integrated into the dashboard. Enable it via the widget toggle to start automatically mining the lowest difficulty chain.

---

**Last Updated**: December 2024
**Status**: Production Ready

