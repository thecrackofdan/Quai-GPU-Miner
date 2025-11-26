# Quai Network Mining Pools Guide

## Overview

While solo mining with your own node gives you **100% of rewards**, pool mining offers:
- ✅ **Steady payouts** (smaller but more frequent)
- ✅ **No node required** (easier setup)
- ✅ **Lower variance** (more predictable income)
- ✅ **Community support** (help from pool operators)

## Pool vs Solo Mining

| Feature | Solo Mining | Pool Mining |
|---------|------------|-------------|
| **Rewards** | 100% (when you find a block) | Shared (minus pool fee) |
| **Payout Frequency** | Variable (depends on luck) | Regular (daily/weekly) |
| **Node Required** | ✅ Yes | ❌ No |
| **Setup Complexity** | Higher | Lower |
| **Best For** | Large hash rate | Small-medium hash rate |

## Available Quai Network Pools

### 1. Quai Network Official Pool
- **URL**: `stratum+tcp://pool.quai.network:3333`
- **Fee**: 0.5%
- **Mining**: Quai Network (Prime + all zones)
- **Payout**: Daily
- **Minimum Payout**: 0.1 QUAI
- **Features**:
  - Official Quai Network pool
  - Low latency
  - Reliable infrastructure
  - Support for all Quai chains

### 2. QuaiMiner Pool
- **URL**: `stratum+tcp://pool.quaiminer.io:3333`
- **Fee**: 1.0%
- **Mining**: Quai Network (Prime + all zones)
- **Payout**: Daily
- **Minimum Payout**: 0.05 QUAI
- **Features**:
  - Community-run pool
  - Active support
  - Detailed statistics
  - Multi-chain support

### 3. QuaiHash Pool
- **URL**: `stratum+tcp://pool.quaihash.com:3333`
- **Fee**: 1.5%
- **Mining**: Quai Network (Prime + all zones)
- **Payout**: Weekly
- **Minimum Payout**: 0.2 QUAI
- **Features**:
  - Established pool
  - Good uptime
  - Regular payouts

### 4. Solo Mining (Your Own Node)
- **URL**: `stratum://localhost:3333` (your node's stratum proxy)
- **Fee**: 0% (100% rewards)
- **Mining**: Quai Network (all chains)
- **Payout**: When you find a block
- **Minimum Payout**: Block reward (varies by chain)
- **Features**:
  - Full control
  - No fees
  - Supports network decentralization
  - Requires running Quai node

## Pool Selection Recommendations

### For Small Miners (< 50 MH/s)
**Recommended**: Pool mining
- More consistent payouts
- Lower variance
- Easier setup

### For Medium Miners (50-200 MH/s)
**Recommended**: Either pool or solo
- Pool: Steady income
- Solo: Higher potential rewards

### For Large Miners (> 200 MH/s)
**Recommended**: Solo mining
- Better long-term returns
- No pool fees
- Supports network

## Pool Configuration

### Stratum URL Format
```
stratum+tcp://pool.example.com:3333
```

### Worker Format
```
<wallet-address>.<worker-name>
```

Example:
```
0x1234567890abcdef1234567890abcdef12345678.rig1
```

### Password
Most pools use `x` or leave empty.

## Fee Comparison

| Pool | Fee | Effective Hash Rate Loss |
|------|-----|-------------------------|
| Solo (Your Node) | 0% | 0% |
| Quai Network Official | 0.5% | 0.5% |
| QuaiMiner Pool | 1.0% | 1.0% |
| QuaiHash Pool | 1.5% | 1.5% |

**Note**: A 1% fee means you lose 1% of your potential earnings.

## Pool Features Comparison

| Feature | Official Pool | QuaiMiner | QuaiHash |
|---------|--------------|-----------|----------|
| Fee | 0.5% | 1.0% | 1.5% |
| Uptime | 99.9% | 99.5% | 99.0% |
| Support | Official | Community | Limited |
| Statistics | Basic | Detailed | Basic |
| Payout Speed | Fast | Fast | Moderate |

## Setting Up Pool Mining

### Method 1: Via Dashboard
1. Open dashboard settings
2. Select "Pool Mining" mode
3. Enter pool URL
4. Enter wallet address
5. Save and start mining

### Method 2: Via Command Line
```bash
# Set pool URL
sudo quaiminer-config set-pool stratum+tcp://pool.quai.network:3333

# Set wallet address
sudo quaiminer-config set-wallet 0xYourWalletAddress

# Start mining
sudo systemctl start quaiminer-miner
```

## Pool Mining Tips

1. **Choose Low-Fee Pools**: Every % matters
2. **Check Uptime**: Higher uptime = more earnings
3. **Monitor Reject Rate**: Should be < 1%
4. **Use Worker Names**: Track individual rigs
5. **Regular Payouts**: Check pool's payout schedule

## Switching Between Pool and Solo

You can switch anytime:
- **To Pool**: Set pool URL in dashboard
- **To Solo**: Set local node URL (`stratum://localhost:3333`)

The OS will automatically detect and configure accordingly.

## Pool Statistics

Most pools provide:
- Your hash rate
- Shares submitted
- Estimated earnings
- Payout history
- Worker statistics

Access via pool's web interface (usually at pool URL, port 80/443).

## Troubleshooting Pool Issues

### High Reject Rate
- Check network latency to pool
- Verify pool URL is correct
- Check if pool is experiencing issues

### No Shares Accepted
- Verify wallet address is correct
- Check worker name format
- Ensure pool is operational

### Low Earnings
- Compare to pool's average
- Check your hash rate
- Verify you're connected to pool

## Security Considerations

⚠️ **Important**:
- Never share your wallet private key
- Use worker names, not wallet addresses as passwords
- Verify pool URLs from official sources
- Check pool's reputation before mining

## Recommended Pools by Hash Rate

### < 20 MH/s
- **QuaiMiner Pool** (1% fee, good for small miners)

### 20-100 MH/s
- **Quai Network Official** (0.5% fee, reliable)

### > 100 MH/s
- **Solo Mining** (0% fee, best returns)

## Pool URLs Reference

```bash
# Official Quai Network Pool
stratum+tcp://pool.quai.network:3333

# QuaiMiner Pool
stratum+tcp://pool.quaiminer.io:3333

# QuaiHash Pool
stratum+tcp://pool.quaihash.com:3333

# Your Own Node (Solo)
stratum://localhost:3333
```

## Additional Resources

- Pool websites (check for latest URLs)
- Quai Network Discord
- Mining community forums
- Pool operator support channels

