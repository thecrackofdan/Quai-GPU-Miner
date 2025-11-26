# SOAP Staking Integration - Complete Guide

## Overview

QuaiMiner CORE OS now fully integrates SOAP protocol staking functionality, allowing users to stake their QUAI and QI tokens for additional rewards. Staking balances and rewards are automatically considered in the profit optimizer's auto-selection algorithm, ensuring optimal chain selection based on both mining profitability AND staking rewards.

## Features

### 1. Staking Management
- **Stake Tokens**: Lock tokens for 7-365 days with increasing reward multipliers
- **Unstake Tokens**: Unlock tokens after lockup period expires
- **View Balances**: Track staked amounts, available balance, and locked tokens per chain
- **Reward Tracking**: Monitor daily, weekly, monthly, and total staking rewards

### 2. Lockup Periods & Multipliers
- **7 days**: 1.0x rewards (flexible, no bonus)
- **30 days**: 1.1x rewards (10% bonus)
- **90 days**: 1.25x rewards (25% bonus)
- **180 days**: 1.5x rewards (50% bonus)
- **365 days**: 2.0x rewards (100% bonus)

### 3. Auto-Selection Integration
The profit optimizer now considers:
- **Mining Rewards**: Based on hash rate, difficulty, and block rewards
- **Staking Rewards**: Daily staking rewards from locked tokens
- **Combined Profitability**: Total rewards (mining + staking) for optimal chain selection
- **Staking APY**: Annual percentage yield for staking positions

## Usage

### Accessing Staking Features

1. **Dashboard Widget**: 
   - View staking overview in the "💰 SOAP Staking" widget
   - Click "Manage Staking" to open full staking interface

2. **Staking Modal**:
   - View all chain staking positions
   - Stake new tokens
   - Unstake unlocked tokens
   - Monitor rewards and lockup periods

### Staking Tokens

1. Click "Manage Staking" button in dashboard
2. Select chain (Prime, Cyprus, Paxos, Hydra)
3. Enter amount to stake
4. Choose lockup period (7-365 days)
5. Click "Stake Tokens"
6. Confirm transaction

### Auto-Selection Behavior

The profit optimizer automatically:
1. Fetches staking rewards for each chain
2. Calculates combined profitability (mining + staking)
3. Compares all chains with staking bonuses applied
4. Switches to most profitable chain (mining + staking combined)
5. Updates display to show both mining and staking rewards

## API Endpoints

### Get Staking Balances
```http
GET /api/staking/balances
```

Response:
```json
{
  "success": true,
  "balances": {
    "prime": {
      "staked": 1000.0,
      "available": 500.0,
      "locked": 1000.0
    }
  },
  "rewards": {
    "prime": {
      "daily": 2.5,
      "weekly": 17.5,
      "monthly": 75.0,
      "total": 500.0,
      "apy": 12.5
    }
  },
  "lockupPeriods": {
    "prime": {
      "period": 90,
      "daysRemaining": 45,
      "unlockDate": "2024-12-31T00:00:00Z",
      "rewardMultiplier": 1.25
    }
  }
}
```

### Stake Tokens
```http
POST /api/staking/stake
Content-Type: application/json

{
  "chainId": "prime",
  "amount": 100.0,
  "lockupDays": 90
}
```

### Unstake Tokens
```http
POST /api/staking/unstake
Content-Type: application/json

{
  "chainId": "prime",
  "amount": 50.0
}
```

### Get Staking Rewards
```http
GET /api/staking/rewards?chainId=prime
```

## Profit Optimizer Integration

### Calculation Method

The profit optimizer now calculates:

1. **Mining Rewards**:
   ```
   Expected Mining Rewards = (User Hash Rate / Network Hash Rate) × Blocks Per Day × Block Reward
   ```

2. **Staking Rewards**:
   ```
   Daily Staking Rewards = Staked Amount × (APY / 365) × Reward Multiplier
   ```

3. **Combined Profitability**:
   ```
   Combined Daily Rewards = Mining Rewards + Staking Rewards
   Combined Value Score = Combined Rewards × Token Price
   ```

4. **Auto-Selection Score**:
   ```
   Base Score = Combined Value Score
   If Staking Enabled: Score × (1 + Staking Contribution Bonus)
   ```

### Staking Bonuses in Auto-Selection

- **Profitability Strategy**: 10% bonus for chains with staking
- **Stability Strategy**: 5% bonus for staking stability
- **Balanced Strategy**: 8% bonus for balanced approach with staking

## Configuration

### Staking Settings

Staking data is stored in the configuration:
```json
{
  "staking_balances": {
    "balances": {
      "prime": {
        "staked": 1000.0,
        "available": 500.0,
        "locked": 1000.0
      }
    },
    "rewards": {
      "prime": {
        "daily": 2.5,
        "apy": 12.5
      }
    },
    "lockupPeriods": {
      "prime": {
        "period": 90,
        "daysRemaining": 45,
        "unlockDate": "2024-12-31T00:00:00Z",
        "rewardMultiplier": 1.25
      }
    }
  }
}
```

## Remote Access

All staking features are accessible remotely through the web dashboard:

1. **Dashboard**: View staking overview and quick stats
2. **Staking Modal**: Full staking management interface
3. **Profit Optimizer**: See staking-influenced profitability
4. **API**: Programmatic access to all staking functions

## Best Practices

1. **Diversify Staking**: Stake across multiple chains for risk distribution
2. **Long-Term Stakes**: Use longer lockup periods for higher multipliers
3. **Monitor Rewards**: Check staking rewards regularly
4. **Auto-Selection**: Enable profit optimizer to automatically consider staking
5. **Unlock Timing**: Plan unstaking around lockup expiration dates

## Technical Details

### Staking Manager (`staking-manager.js`)
- Manages staking balances and rewards
- Fetches data from SOAP staking contract
- Updates profit optimizer with staking data
- Handles stake/unstake operations

### Staking UI (`staking-ui.js`)
- Provides user interface for staking management
- Displays staking positions and rewards
- Handles stake/unstake forms
- Shows lockup period information

### Profit Optimizer Integration
- Automatically fetches staking rewards
- Includes staking in profitability calculations
- Applies staking bonuses to auto-selection
- Displays combined rewards in UI

## Future Enhancements

1. **Auto-Compounding**: Automatically reinvest staking rewards
2. **Staking Pools**: Join staking pools for better rates
3. **Advanced Analytics**: Historical staking performance
4. **Notifications**: Alerts for lockup expiration
5. **Multi-Signature**: Enhanced security for large stakes

## Support

For issues or questions:
- Check dashboard staking widget
- Review API documentation
- Check SOAP protocol documentation
- Contact Quai Network support

---

**Last Updated**: December 2024
**Status**: Fully Integrated and Production Ready

