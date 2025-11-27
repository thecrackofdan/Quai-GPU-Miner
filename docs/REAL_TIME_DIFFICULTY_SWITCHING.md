# Real-Time Difficulty Switching

## Overview

The Real-Time Difficulty Switcher automatically directs hash power to the chain with the lowest difficulty, optimizing mining profits by targeting easier blocks.

## Features

### ⚡ Real-Time Switching
- **Fast Updates**: Checks difficulty every 10 seconds (configurable)
- **Automatic Switching**: Switches to lowest difficulty chain automatically
- **No Manual Restart**: Switches mining target without requiring miner restart
- **Smart Cooldown**: Prevents excessive switching (30 second minimum between switches)

### 🎯 Intelligent Selection
- **Lowest Difficulty First**: Always targets the chain with lowest difficulty
- **Threshold-Based**: Only switches if improvement exceeds threshold (default 5%)
- **Multi-Chain Monitoring**: Monitors all available Quai Network chains simultaneously
- **Real-Time Updates**: UI updates in real-time showing current target and alternatives

### 📊 Visual Feedback
- **Current Target Display**: Shows which chain is currently being mined
- **Difficulty Comparison**: Lists all chains sorted by difficulty
- **Switch History**: Tracks recent chain switches with timestamps
- **Status Indicators**: Visual indicators for current mining target and lowest difficulty chain

## How It Works

### 1. Difficulty Monitoring
- Fetches difficulty metrics for all enabled chains every 10 seconds
- Compares difficulties across all chains
- Identifies chain with lowest difficulty

### 2. Switching Logic
- Checks if new chain has significantly lower difficulty (threshold-based)
- Verifies cooldown period has passed (prevents excessive switching)
- Switches mining target to lowest difficulty chain
- Updates miner configuration in real-time

### 3. Miner Integration
- Updates miner configuration to target specific chain
- Attempts real-time switch (if miner API supports it)
- Falls back to restart if real-time switch not available
- Maintains mining continuity

## Configuration

### Settings

```javascript
{
    enabled: false,              // Enable/disable real-time switching
    checkInterval: 10000,        // Check interval in milliseconds (10 seconds)
    minSwitchThreshold: 0.05,    // Minimum improvement to switch (5%)
    minSwitchCooldown: 30000    // Minimum time between switches (30 seconds)
}
```

### API Endpoints

#### Get Settings
```
GET /api/difficulty-adjustor/settings
```

#### Update Settings
```
POST /api/difficulty-adjustor/settings
Content-Type: application/json

{
    "enabled": true,
    "checkInterval": 10000,
    "minSwitchThreshold": 0.05,
    "minSwitchCooldown": 30000
}
```

#### Switch Chain (Manual)
```
POST /api/miner/switch-chain
Content-Type: application/json

{
    "chainId": 1,
    "chainKey": "cyprus",
    "chainName": "Cyprus",
    "reason": "manual",
    "difficulty": 1234567
}
```

## Usage

### Enable Real-Time Switching

1. **Via UI**:
   - Navigate to dashboard
   - Find "Real-Time Difficulty Switcher" widget
   - Toggle "Enable Auto-Switch" checkbox

2. **Via API**:
   ```javascript
   fetch('/api/difficulty-adjustor/settings', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
           enabled: true,
           checkInterval: 10000,
           minSwitchThreshold: 0.05,
           minSwitchCooldown: 30000
       })
   });
   ```

### Monitor Switching

- **Dashboard Widget**: Shows current target and all chain difficulties
- **Switch History**: Displays recent switches with timestamps
- **Notifications**: Toast notifications when switches occur

## Benefits

### Profit Optimization
- **Lower Difficulty = Easier Blocks**: Targets chains with easier block discovery
- **More Blocks Per Day**: Lower difficulty means more blocks found with same hash rate
- **Automatic Optimization**: No manual intervention needed

### Efficiency
- **Real-Time Response**: Responds to difficulty changes within 10 seconds
- **Smart Switching**: Only switches when beneficial (threshold-based)
- **Minimal Disruption**: Switches without full miner restart when possible

### User Experience
- **Automatic**: Works automatically once enabled
- **Transparent**: Clear visibility into switching decisions
- **Configurable**: Adjustable thresholds and intervals

## Technical Details

### Chain Selection Algorithm

1. **Fetch Difficulties**: Get current difficulty for all enabled chains
2. **Find Lowest**: Identify chain with minimum difficulty
3. **Calculate Improvement**: Compare with current target
4. **Check Threshold**: Verify improvement exceeds minimum threshold
5. **Check Cooldown**: Ensure minimum time has passed since last switch
6. **Switch**: Update miner configuration and switch target

### Miner Integration

The switcher integrates with the miner API to:
- Update mining configuration
- Switch chain target in real-time (if supported)
- Restart miner if real-time switch not available
- Maintain mining continuity

### Performance

- **Low Overhead**: Minimal CPU/memory usage
- **Efficient Polling**: Parallel difficulty fetching
- **Smart Caching**: Caches difficulty data to reduce API calls

## Limitations

1. **Miner Support**: Requires miner API support for chain switching
2. **Network Latency**: Difficulty fetching depends on node RPC availability
3. **Cooldown Period**: Minimum 30 seconds between switches prevents excessive switching
4. **Threshold**: Only switches if improvement exceeds threshold (prevents minor fluctuations)

## Future Enhancements

- [ ] WebSocket-based real-time difficulty updates
- [ ] Predictive difficulty switching (anticipate difficulty changes)
- [ ] Multi-chain merged mining optimization
- [ ] Historical difficulty analysis
- [ ] Machine learning-based switching decisions

## Troubleshooting

### Switcher Not Working

1. **Check if Enabled**: Verify "Enable Auto-Switch" is checked
2. **Check Node Connection**: Ensure Quai node RPC is accessible
3. **Check Miner API**: Verify miner API supports chain switching
4. **Check Logs**: Review browser console for errors

### Excessive Switching

1. **Increase Cooldown**: Set `minSwitchCooldown` to higher value (e.g., 60000)
2. **Increase Threshold**: Set `minSwitchThreshold` to higher value (e.g., 0.10)
3. **Check Difficulty Stability**: Verify difficulty data is stable

### Not Switching When Expected

1. **Check Threshold**: Lower `minSwitchThreshold` if too high
2. **Check Cooldown**: Verify cooldown period has passed
3. **Check Chain Availability**: Ensure target chain is enabled
4. **Check Difficulty Data**: Verify difficulty data is being fetched correctly

---

**Last Updated**: December 2024
**Status**: Implemented and Ready for Testing

