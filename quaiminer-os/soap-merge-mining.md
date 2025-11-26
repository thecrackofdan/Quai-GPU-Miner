# SOAP Merge Mining with Ravencoin & Staking

## Overview

SOAP (Solo Optimized Algorithm Protocol) is designed to enable merge mining between Quai Network and Ravencoin, allowing miners to earn rewards from both networks simultaneously. The protocol also includes **staking functionality** with lockup periods, allowing miners to stake their tokens for additional rewards.

## Staking Features

### Lockup Periods
SOAP introduces configurable lockup periods for staking:
- **Short-term**: 7-30 days (lower rewards, flexible)
- **Medium-term**: 30-90 days (moderate rewards)
- **Long-term**: 90-365 days (higher rewards, maximum lockup)

### Staking Rewards
- Earn additional rewards on top of mining rewards
- Rewards are proportional to staked amount and lockup period
- Staking balances are tracked separately from mining rewards
- Auto-compounding available for long-term stakes

### Staking Integration
- Staking balances accessible through CORE OS dashboard
- Remote access to staking information via web interface
- Auto-selection considers both mining profitability AND staking rewards
- Combined profitability calculation (mining + staking)

## Current Status

**Note**: SOAP merge mining is under active development. This document will be updated as more information becomes available.

## Implementation Plan

### Phase 1: Algorithm Detection
- Detect SOAP algorithm support in quai-gpu-miner
- Verify Ravencoin compatibility
- Test merge mining functionality

### Phase 2: Configuration
- Add SOAP configuration options
- Enable/disable merge mining
- Configure Ravencoin parameters

### Phase 3: Integration
- Integrate SOAP support into QuaiMiner CORE OS
- Update dashboard for merge mining stats
- Add merge mining controls

## Configuration

When SOAP is fully implemented, configuration will be available via:

```json
{
  "merge_mining": {
    "enabled": true,
    "algorithm": "SOAP",
    "ravencoin": {
      "enabled": true,
      "wallet": "RVN_WALLET_ADDRESS"
    }
  }
}
```

## Resources

### Official Sources to Monitor

1. **Quai Network GitHub Repositories**:
   - **quai-gpu-miner**: https://github.com/dominant-strategies/quai-gpu-miner
     - Check for SOAP/merge mining commits
     - Review releases and changelogs
   - **go-quai**: https://github.com/dominant-strategies/go-quai
     - Network protocol updates
     - SOAP implementation status

2. **Quai Network Documentation**:
   - **docs.qu.ai**: https://docs.qu.ai
   - **docs.v2.qu.ai**: https://docs.v2.qu.ai
   - Check for SOAP/merge mining guides

3. **Community Channels**:
   - **Quai Network Discord**: https://discord.gg/quai
     - #mining channel for updates
     - #announcements for official news
   - **Quai Network Twitter/X**: For official announcements

4. **Ravencoin Resources**:
   - **Ravencoin.org**: https://ravencoin.org
   - **Ravencoin GitHub**: Check for merge mining support

## Algorithm Compatibility

### Current Status

| Network | Algorithm | Status | Merge Mining Compatible? |
|---------|-----------|--------|-------------------------|
| Quai Network | ProgPoW (SOAP) | ✅ Active | ⚠️ Pending |
| Ravencoin | KAWPOW | ✅ Active | ⚠️ Pending |

**Note**: SOAP is an upgrade from KAWPOW, but merge mining requires specific protocol support that may not be fully implemented yet.

## Implementation Readiness

### When SOAP Merge Mining Becomes Available

QuaiMiner CORE OS is prepared to support SOAP merge mining with the following features:

1. **Configuration System**:
   - Merged mining configuration wizard
   - Ravencoin wallet address support
   - Enable/disable toggle

2. **Dashboard Integration**:
   - Dual network statistics
   - Separate reward tracking (QUAI + RVN)
   - Combined profitability display

3. **Miner Configuration**:
   - Automatic config generation
   - SOAP algorithm detection
   - Dual wallet support

## How to Check for Updates

### Automated Check Script

```bash
# Check quai-gpu-miner for SOAP updates
curl -s https://api.github.com/repos/dominant-strategies/quai-gpu-miner/releases/latest | grep -i "soap\|merge"

# Check go-quai for protocol updates
curl -s https://api.github.com/repos/dominant-strategies/go-quai/releases/latest | grep -i "soap\|merge"
```

### Manual Check

1. Visit quai-gpu-miner GitHub releases
2. Check commit history for "SOAP" or "merge mining"
3. Review Quai Network Discord announcements
4. Check official documentation updates

## Expected Configuration (When Available)

```json
{
  "merge_mining": {
    "enabled": true,
    "algorithm": "SOAP",
    "ravencoin": {
      "enabled": true,
      "wallet": "RVN_WALLET_ADDRESS",
      "pool": "optional_pool_url",
      "stratum": "stratum+tcp://pool.example.com:3333"
    },
    "quai": {
      "enabled": true,
      "wallet": "QUAI_WALLET_ADDRESS",
      "node": "http://localhost:8545"
    }
  }
}
```

## Benefits (When Available)

- ✅ **Dual Rewards**: Earn both QUAI and RVN simultaneously
- ✅ **Maximize Hash Rate**: Use same hash rate for both networks
- ✅ **Lower Variance**: More consistent rewards
- ✅ **Portfolio Diversification**: Hold both tokens

## Updates

**Last Updated**: November 2024
**Next Check**: Monitor Quai Network announcements monthly
**Status**: Still in development - not yet available for production use

This document will be updated as SOAP merge mining becomes available. Check back regularly or monitor official Quai Network channels for the latest information.

