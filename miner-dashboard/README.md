# QuaiMiner CORE - Best Looking Mining Dashboard

**The most beautiful, easiest-to-use mining dashboard for Quai and Qi**

🌐 **QuaiMiner CORE:** [Main Repository](https://github.com/thecrackofdan/quaiminer-core) - Complete mining toolkit | 📊 **Dashboard:** [Launch Dashboard](public/index.html)

## Why It's the Best

**The best-looking, easiest-to-use mining dashboard for Quai Network. Better than HiveOS, better than anything else.**

- **🎨 Beautiful Design**: Modern, intuitive interface that's a joy to use
- **⚡ Easiest Setup**: Get mining in under 5 minutes
- **🏊 Best Pool**: Join our DePool for lowest fees and fastest payouts
- **💎 Quai & Qi Optimized**: Built specifically for Quai Network multi-chain mining
- **🔄 Auto-Optimization**: Automatically switches between chains for maximum profit
- **💰 Merged Mining**: Mine multiple chains simultaneously

## Features

**Everything you need for the best Quai & Qi mining experience**

- **🎨 Beautiful Dashboard**: The most beautiful mining interface you'll ever use
- **⚡ One-Click Mining**: Start mining with a single click
- **🏊 DePool Management**: Complete pool control or connect to our best pool
- **Pool Statistics**: Real-time pool statistics (total miners, hash rate, blocks found, revenue, fees)
- **Miner Management**: View all connected miners, their hash rates, shares, pending balances
- **Automated Payouts**: Automatic payout calculation and processing (PPS model)
- **Fee Management**: Configurable pool fees with profitability optimization
- **Profitability Analysis**: Track revenue, costs, profit margins, and projections
- **Share Tracking**: Track all submitted shares (accepted/rejected) in real-time
- **Block Recording**: Record and display blocks found by pool miners
- **Real-time Mining Statistics**: Hash rate, shares, temperature monitoring
- **GPU Performance Tracking**: Individual GPU metrics and health monitoring
- **Quai & Qi Native**: Auto-switching between chains, merged mining support
- **Multi-currency Display**: QUAI, USD, EUR, GBP, BTC, ETH
- **Pelagus Wallet Integration**: Connect and monitor wallet activity
- **Responsive Design**: Works beautifully on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- Linux terminal
- Quai Network node running (for DePool operation)
- Stratum proxy enabled on your node (usually port 3333)

### Installation

1. **Install Node.js** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   ```

2. **Clone this repository**:
   ```bash
   git clone https://github.com/thecrackofdan/quaiminer-core.git
   cd quaiminer-core/miner-dashboard
   ```

3. **Make the startup script executable**:
   ```bash
   chmod +x start.sh
   ```

4. **Run the dashboard**:
   ```bash
   ./start.sh
   ```

The dashboard will automatically:
- Check for Node.js and npm
- Install dependencies (first time only)
- Start the server on http://localhost:3000
- Open your browser automatically

## Manual Start

```bash
# Install dependencies (first time only)
npm install

# Start server
npm start
```

Then open http://localhost:3000 in your browser.

## Configuration

Edit `public/js/config.js` to configure:

- **Node RPC URL**: Default `http://localhost:8545`
- **Mining API**: Enable/disable and set URL
- **GPU Configuration**: Add your GPU details
- **Network Settings**: Chain selection, mining mode
- **Update Intervals**: Data refresh rates

### Example Configuration

```javascript
api: {
    enabled: true,
    url: 'http://192.168.2.110:8545',
    updateInterval: 5000
},
gpus: [
    {
        id: 0,
        name: 'AMD RX 590',
        baseHashRate: 10.5,
        maxTemp: 85,
        targetTemp: 70
    }
],
node: {
    rpcUrl: 'http://localhost:8545',
    enableMetrics: true
},
depool: {
    enabled: true,
    fee: 1.0,              // Pool fee percentage (0-5%)
    minPayout: 0.1,       // Minimum payout in QUAI
    payoutInterval: 86400000  // Payout interval in milliseconds (24 hours)
}
```

### DePool Setup

1. **Enable DePool**: Open dashboard → Click "🏊 DePool Manager" → Toggle "Enable DePool"
2. **Configure Settings**: Set pool fee, minimum payout, and payout interval
3. **Share Stratum Endpoint**: Share `stratum://YOUR_NODE_IP:3333` with miners
4. **Monitor**: View pool statistics, connected miners, and profitability in real-time

For complete DePool documentation, see [DePool System Guide](../docs/DEPOOL_SYSTEM.md).

## Server Endpoints

- **Dashboard**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **RPC Proxy**: http://localhost:3000/api/rpc

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### Node.js Not Found

```bash
# Install Node.js
sudo apt install nodejs npm
```

### Permission Denied

```bash
# Make script executable
chmod +x start.sh
```

### Dashboard Not Loading

1. Check browser console (F12) for errors
2. Verify Node.js is running: `node --version`
3. Check server logs in terminal
4. Ensure config.js loads without errors

## Development

Run in development mode with verbose logging:

```bash
NODE_ENV=development npm start
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name quai-dashboard
   pm2 save
   pm2 startup
   ```

## License

MIT

## Related Projects

- [QuaiMiner CORE](https://github.com/thecrackofdan/quaiminer-core) - Complete mining toolkit with setup scripts, research, and AMD GPU configuration tools

## Support

For issues and questions, check the documentation in the `docs/` directory.
