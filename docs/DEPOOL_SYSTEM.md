# DePool System - Transform Your Node into a Mining Pool

## Overview

The DePool (Decentralized Pool) system allows you to transform your Quai Network node into a mining pool, enabling you to:
- Accept miners and manage their hash power
- Calculate and distribute payouts automatically
- Charge pool fees for profitability
- Optimize fee structure for maximum revenue
- Track pool statistics and profitability

## Features

### 🏊 Pool Management
- **Miner Registration**: Automatically register miners when they connect
- **Share Tracking**: Track all submitted shares (accepted/rejected)
- **Block Recording**: Record blocks found by pool miners
- **Real-Time Statistics**: Monitor pool performance in real-time

### 💰 Payout System
- **Automatic Calculations**: Calculate miner payouts based on shares and blocks
- **PPS (Pay Per Share)**: Miners get paid for each accepted share
- **Block Rewards**: Distribute block rewards proportionally
- **Minimum Payout**: Set minimum payout threshold
- **Scheduled Payouts**: Automatic payout processing at intervals

### 💵 Fee Management
- **Configurable Fee**: Set pool fee (0-5%, recommended 0.5-2%)
- **Fee Optimization**: AI-powered fee optimization for maximum profitability
- **Revenue Tracking**: Track pool operator revenue and fees
- **Profitability Analysis**: Calculate daily/monthly profitability

### 📊 Statistics & Analytics
- **Pool Statistics**: Total miners, hash rate, blocks found
- **Miner Statistics**: Per-miner hash rate, shares, pending balance
- **Revenue Tracking**: Total revenue, fees collected, payouts processed
- **Profitability Metrics**: Daily costs, revenue, profit, profit margin

## How It Works

### 1. Enable DePool Mode

1. Open dashboard
2. Click "🏊 DePool Manager" button
3. Toggle "Enable DePool" switch
4. Configure pool settings (fee, minimum payout, etc.)
5. Save configuration

### 2. Miners Connect

Miners connect to your node's stratum endpoint:
```
stratum://YOUR_NODE_IP:3333
```

When a miner connects:
- They are automatically registered
- Their hash rate is tracked
- Their shares are recorded
- Their pending balance accumulates

### 3. Share Submission

Each share submitted by a miner:
- Is validated and recorded
- Contributes to miner's pending balance
- Updates pool statistics
- Triggers payout calculation if eligible

### 4. Block Discovery

When a block is found:
- Block reward is recorded
- Pool fee is calculated (e.g., 1% of block reward)
- Remaining reward is distributed to finding miner
- Pool operator receives fee

### 5. Payout Processing

Payouts are processed automatically:
- Check all miners for eligible payouts
- Calculate payout amount (pending balance)
- Verify minimum payout threshold
- Process payouts (send to miner wallets)
- Update miner balances

## Configuration

### Pool Settings

```javascript
{
    enabled: false,              // Enable/disable DePool
    fee: 1.0,                    // Pool fee percentage (0-5%)
    minPayout: 0.1,              // Minimum payout in QUAI
    payoutInterval: 86400000,    // Payout interval in milliseconds (24 hours)
    shareDifficulty: 1000000,    // Share difficulty threshold
    blockRewardShare: 0.99       // Share of block reward to miners (99%)
}
```

### API Endpoints

#### Get Pool Configuration
```
GET /api/depool/config
```

#### Save Pool Configuration
```
POST /api/depool/config
Content-Type: application/json

{
    "enabled": true,
    "fee": 1.0,
    "minPayout": 0.1,
    "payoutInterval": 86400000
}
```

#### Start DePool Services
```
POST /api/depool/start
```

#### Stop DePool Services
```
POST /api/depool/stop
```

#### Get Pool Statistics
```
GET /api/depool/stats
```

#### Register Miner
```
POST /api/depool/miners
Content-Type: application/json

{
    "id": "0x1234...5678.worker1",
    "walletAddress": "0x1234...5678",
    "workerName": "worker1"
}
```

#### Submit Share
```
POST /api/depool/shares
Content-Type: application/json

{
    "minerId": "0x1234...5678.worker1",
    "difficulty": 1000000,
    "accepted": true,
    "blockFound": false
}
```

#### Record Block
```
POST /api/depool/blocks
Content-Type: application/json

{
    "minerId": "0x1234...5678.worker1",
    "reward": 2.0,
    "chain": "prime",
    "blockNumber": 1234567
}
```

#### Process Payouts
```
POST /api/depool/payouts/process
Content-Type: application/json

{
    "payouts": [
        {
            "minerId": "0x1234...5678.worker1",
            "walletAddress": "0x1234...5678",
            "amount": 0.5
        }
    ]
}
```

## Payout Calculation

### PPS (Pay Per Share) Model

Each accepted share earns the miner a reward:

```
Share Reward = (Block Reward × Share Difficulty) / (Network Difficulty × Pool Hash Rate)
```

### Block Reward Distribution

When a block is found:

```
Pool Fee = Block Reward × (Pool Fee % / 100)
Miner Reward = Block Reward - Pool Fee
```

### Total Miner Payout

```
Total Payout = Sum of Share Rewards + Sum of Block Rewards
```

## Profitability Optimization

### Fee Optimization

The system analyzes:
- Current miner count
- Total pool hash rate
- Revenue vs costs
- Market conditions

And recommends optimal fee:
- **Low miners (< 10)**: Lower fee to attract more (0.5-1%)
- **Many miners (> 50)**: Can increase fee slightly (1-2%)
- **High hash rate**: Optimize for maximum revenue

### Profitability Calculation

```
Daily Revenue = Pool Fees Collected
Daily Costs = Node Operation Costs (electricity, hosting)
Daily Profit = Daily Revenue - Daily Costs
Profit Margin = (Daily Profit / Daily Revenue) × 100%
```

## Benefits

### For Pool Operator (You)

- **Passive Income**: Earn fees from miners
- **Scalable**: More miners = more revenue
- **Control**: Set your own fees and policies
- **Analytics**: Track profitability and optimize

### For Miners

- **Steady Payouts**: Regular payouts vs solo mining variance
- **No Node Required**: Miners don't need to run a node
- **Lower Fees**: DePool fees typically lower than traditional pools
- **Decentralized**: No single point of failure

## Setup Instructions

### 1. Enable DePool

1. Open dashboard
2. Navigate to "🏊 DePool Manager"
3. Toggle "Enable DePool"
4. Configure settings:
   - **Fee**: 0.5-2.0% (recommended)
   - **Minimum Payout**: 0.1 QUAI (recommended)
   - **Payout Interval**: 24 hours (recommended)
5. Click "Save Configuration"

### 2. Configure Node

Your node needs to:
- Accept external stratum connections
- Be accessible to miners (public IP or port forwarding)
- Have stratum proxy enabled

### 3. Share Stratum Endpoint

Share your stratum endpoint with miners:
```
stratum://YOUR_NODE_IP:3333
```

Or if using domain:
```
stratum://pool.yourdomain.com:3333
```

### 4. Monitor Pool

- View pool statistics in dashboard
- Monitor connected miners
- Track revenue and profitability
- Process payouts automatically

## Security Considerations

### Miner Validation
- Validate miner wallet addresses
- Verify share difficulty
- Prevent share manipulation
- Rate limit share submissions

### Payout Security
- Verify minimum payout threshold
- Validate wallet addresses before payout
- Secure payout processing
- Audit trail for all payouts

### Pool Security
- Secure API endpoints
- Authentication for pool management
- Rate limiting
- Input validation

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Advanced payout models (PPLNS, PROP)
- [ ] Multi-chain pool support
- [ ] Miner statistics dashboard
- [ ] Automated fee optimization
- [ ] Pool operator dashboard
- [ ] Miner referral system
- [ ] Pool performance analytics

---

**Last Updated**: December 2024
**Status**: Implemented and Ready for Testing

