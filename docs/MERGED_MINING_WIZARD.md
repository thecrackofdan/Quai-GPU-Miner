# Merged Mining Configuration Wizard

## Overview

The Merged Mining Configuration Wizard provides a guided setup for configuring merged mining across multiple Quai Network chains. It collects wallet addresses for Prime, Regions, and Zones, then automatically generates the merged mining configuration file.

## Features

- ✅ **Guided 4-Step Wizard**
  - Introduction and explanation
  - Chain selection (Prime, Regions, Zones)
  - Wallet address entry
  - Review and config generation

- ✅ **Chain Selection**
  - Prime Chain (Level 0)
  - Regions: Cyprus, Paxos, Hydra (Level 1)
  - Zones: 9 zones across 3 regions (Level 2)

- ✅ **Wallet Address Management**
  - Individual addresses per chain
  - Option to use same address for all chains
  - Validation of required addresses

- ✅ **Automatic Config Generation**
  - Generates `merged-mining-config.json`
  - Saves to miner configuration
  - Downloads config file for backup

## How to Use

### Accessing the Wizard

1. **From Dashboard Header:**
   - Click the "🔗 Merged Mining" button in the header controls

2. **From Miner Configuration:**
   - Open Miner Configuration modal
   - Look for merged mining options

### Step-by-Step Process

#### Step 1: Introduction
- Learn about merged mining
- Understand chain hierarchy
- Review requirements

#### Step 2: Chain Selection
- Select which chains to mine:
  - **Prime** (recommended)
  - **Regions** (Cyprus, Paxos, Hydra)
  - **Zones** (9 zones total)
- At least one chain must be selected

#### Step 3: Wallet Addresses
- Enter QI wallet addresses for each selected chain
- Option to use same address for all chains
- All selected chains must have addresses

#### Step 4: Review & Generate
- Review your configuration
- See summary of selected chains
- Generate and save config file

## Configuration Format

The wizard generates a configuration file with this structure:

```json
{
  "enabled": true,
  "chains": [0, 1, 2, 3],
  "wallets": {
    "prime": "0x...",
    "regions": {
      "cyprus": "0x...",
      "paxos": "0x...",
      "hydra": "0x..."
    },
    "zones": {
      "cyprus1": "0x...",
      "cyprus2": "0x...",
      "cyprus3": "0x...",
      "paxos1": "0x...",
      "paxos2": "0x...",
      "paxos3": "0x...",
      "hydra1": "0x...",
      "hydra2": "0x...",
      "hydra3": "0x..."
    }
  },
  "selectedChains": {
    "prime": true,
    "cyprus": false,
    ...
  }
}
```

## Chain IDs

- **Prime**: 0
- **Cyprus Region**: 1
- **Paxos Region**: 2
- **Hydra Region**: 3
- **Zones**: Specific chain IDs based on region and zone number

## File Locations

- **Config File**: `quaiminer-os/config/merged-mining-config.json`
- **Downloaded Backup**: `merged-mining-config.json` (in downloads)

## Integration

The wizard integrates with:
- Miner configuration API
- Dashboard merged mining status display
- Config file generation system

## Requirements

- QI wallet addresses for each selected chain
- At least one chain must be selected
- Valid wallet address format (0x...)

## Tips

1. **Start Simple**: Begin with just Prime chain
2. **Same Address**: Use same address for all chains for simplicity
3. **Backup Config**: Download the generated config file
4. **Test First**: Test with a few chains before enabling all

## Troubleshooting

### Wizard Won't Open
- Check browser console for errors
- Verify `merged-mining-wizard.js` is loaded
- Refresh the page

### Config Not Saving
- Check server logs for errors
- Verify write permissions to config directory
- Check API endpoint `/api/miner/config`

### Wallet Address Validation
- Ensure addresses start with `0x`
- Check address length (should be 42 characters)
- Verify addresses are valid QI addresses

## API Endpoints

- `POST /api/miner/config` - Saves merged mining configuration
- `GET /api/miner/config` - Retrieves current configuration

## Next Steps

After generating the config:
1. Review the generated file
2. Restart miner if needed
3. Monitor merged mining status in dashboard
4. Check rewards across all chains

