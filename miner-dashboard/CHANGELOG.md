# Changelog

All notable changes to this project will be documented in this file.

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

