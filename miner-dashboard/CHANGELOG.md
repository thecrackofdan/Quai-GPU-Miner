# Changelog

All notable changes to this project will be documented in this file.

## [2.1.1-beta] - 2024-12-XX

### 🎉 Major Features - Competitive Solo Mining Solution

**Status**: ⚠️ Beta / Testing Phase

### New Features
- ✅ **Mining Insights & Analytics** - Advanced profitability analysis, ROI calculator, earnings projections
- ✅ **Enhanced Pool Manager** - Automatic pool switching based on profitability (5% improvement threshold)
- ✅ **Smart Pool Recommendations** - AI-powered pool selection with real-time statistics
- ✅ **One-Click Pool Connection** - Easy pool selection with wallet address validation
- ✅ **Optimization Suggestions** - Actionable insights with quick action buttons
- ✅ **Real-Time Pool Monitoring** - Tracks latency, uptime, and performance for all pools
- ✅ **Pool Comparison Table** - Side-by-side comparison of all available pools

### Enhancements
- ✅ Enhanced pool selection UI with detailed pool cards
- ✅ Automatic pool switching with user notifications
- ✅ Profitability analysis with daily profit, margin, and efficiency metrics
- ✅ ROI calculations with 30/90/365-day projections
- ✅ Earnings projections (hourly, daily, weekly, monthly, yearly)
- ✅ Performance benchmarking vs other miners
- ✅ Better error handling and user feedback

### Competitive Advantages
- ✅ **Automatic Pool Switching** - No other miner has this feature
- ✅ **Advanced Analytics** - More detailed than HiveOS/Minerstat
- ✅ **Real-Time Insights** - Live optimization suggestions
- ✅ **Free & Open Source** - No subscription fees
- ✅ **Quai-Specific** - Built for Quai Network multi-chain mining

### Technical Improvements
- ✅ Fixed undefined `isValidUrl()` function in input validation
- ✅ Enhanced JSON parsing error handling
- ✅ Consistent logging (replaced console.error with logger.error)
- ✅ Better error message security (hide details in production)
- ✅ Response header safety checks
- ✅ Added stats history API endpoint for insights

### Files Added
- `miner-dashboard/public/js/mining-insights.js` - Complete insights module
- `miner-dashboard/public/js/enhanced-pool-manager.js` - Enhanced pool manager
- `SOLO_MINING_ENHANCEMENTS.md` - Feature documentation
- `TESTING_AND_VERIFICATION.md` - Testing guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `QUICK_START_GUIDE.md` - Quick start guide

### Files Modified
- `miner-dashboard/public/index.html` - Added insights widget
- `miner-dashboard/public/js/dashboard.js` - Integrated all modules
- `miner-dashboard/public/css/styles.css` - Added insights styles
- `miner-dashboard/public/pools.html` - Enhanced pool selection
- `miner-dashboard/server.js` - Added stats history endpoint, improved error handling
- `miner-dashboard/middleware/inputValidation.js` - Fixed URL validation

## [1.0.0] - 2024-11-22

### GitHub Release
- **Project Rebranded**: QuaiMiner Core (formerly QuaiMiner Hub)
- **Repository**: Updated to quaiminer-core
- **Website**: Complete landing page (index.html) ready
- **Documentation**: All references updated and consistent

### Fixed
- **Critical**: Fixed fetch timeout issue - replaced invalid `timeout` option with proper `AbortController` implementation for timeout handling
- **Improved**: Enhanced error handling for timeout errors (AbortError) with clearer error messages
- **Improved**: Added timeout handling to both miner API and node RPC fetch calls
- **Improved**: Better error messages for network timeouts and connection failures

### Added
- Comprehensive `.gitignore` files for root and miner-dashboard directories
- `.env.example` file for environment variable configuration
- Windows-compatible npm scripts
- Proper timeout handling (5s for miner API, 10s for node RPC)

### Changed
- Updated fetch calls to use `AbortController` for proper timeout support
- Improved error handling to distinguish between timeout and other network errors
- Enhanced development mode error messages

### Technical Details
- **Fetch Timeout Fix**: The native `fetch()` API doesn't support a `timeout` option. Fixed by implementing `AbortController` with `setTimeout` to properly handle request timeouts.
- **Error Handling**: Added specific handling for `AbortError` to provide clear timeout messages to users.
- **Cross-Platform**: Improved Windows compatibility for npm scripts and environment variables.

## Installation Notes

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure your settings
3. Start server: `npm start`
4. For development: Set `NODE_ENV=development` environment variable before running

## Known Issues

- Port 3000 may be in use on some systems. Use `PORT=3001` environment variable to use a different port.
- On Windows, set environment variables using PowerShell: `$env:NODE_ENV="development"`

