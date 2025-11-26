# Changelog - QuaiMiner CORE OS

## Version 2.0.0 - Complete Mining OS Release

### 🎯 Major Changes

#### Project Rebranding
- **New Name**: QuaiMiner CORE OS (formerly QuaiMiner CORE)
- Complete rebranding across all files and documentation
- Updated GitHub repository references

#### Comprehensive GPU Support
- **Expanded GPU Compatibility**: Support for all ProgPoW-capable GPUs
  - **NVIDIA**: All GTX/RTX series (Kepler through Hopper)
  - **AMD**: All RX series (GCN 1.0 through RDNA 3)
  - **Legacy Support**: Older GPUs (GTX 750+, R9 series, Vega)
- **GPU Compatibility Checker**: New tool to verify GPU compatibility
- **Enhanced Architecture Detection**: Improved detection for all GPU architectures

#### SOAP Merge Mining Preparation
- **SOAP Documentation**: Added documentation for future SOAP/Ravencoin merge mining
- **Configuration Framework**: Prepared configuration structure for merge mining
- **Monitoring Ready**: Dashboard prepared for merge mining statistics

### ✨ New Features

1. **GPU Compatibility Checker** (`gpu-compatibility.sh`)
   - Verifies all GPUs for ProgPoW compatibility
   - Checks memory requirements (minimum 2GB)
   - Validates OpenCL support
   - Provides expected hash rate estimates

2. **Enhanced Hardware Detection**
   - Expanded AMD architecture detection (GCN 1.0-5.0, RDNA 1-3)
   - Better NVIDIA model recognition
   - Improved mixed GPU setup handling

3. **SOAP Merge Mining Framework**
   - Documentation for SOAP implementation
   - Configuration structure ready
   - Monitoring framework prepared

### 🔧 Improvements

- **Better GPU Detection**: More comprehensive architecture recognition
- **Improved Documentation**: Updated all guides and references
- **Professional File Structure**: Better organization and naming

### 📚 Documentation Updates

- Updated all references to "QuaiMiner CORE OS"
- Added GPU compatibility guide
- Added SOAP merge mining documentation
- Updated website and dashboard

### 🐛 Bug Fixes

- Fixed GPU indexing in mixed AMD/NVIDIA setups
- Improved hardware detection accuracy
- Better error handling in driver installation

### 📋 Files Changed

#### New Files
- `quaiminer-os/gpu-compatibility.sh` - GPU compatibility checker
- `quaiminer-os/soap-merge-mining.md` - SOAP merge mining documentation
- `CHANGELOG_QUAIMINER_CORE_OS.md` - This changelog

#### Updated Files
- `README.md` - Updated to QuaiMiner CORE OS
- `index.html` - Updated website branding
- `miner-dashboard/public/index.html` - Updated dashboard branding
- `miner-dashboard/package.json` - Updated package name
- `miner-dashboard/server.js` - Updated server branding
- `quaiminer-os/hardware-detector.sh` - Enhanced GPU detection
- All installation and management scripts - Updated branding

### 🚀 Migration Guide

If upgrading from QuaiMiner CORE:

1. **No breaking changes** - All functionality remains the same
2. **Name change only** - Project is now "QuaiMiner CORE OS"
3. **New features** - GPU compatibility checker and SOAP preparation
4. **Enhanced detection** - Better GPU architecture recognition

### 📊 Supported GPUs

#### NVIDIA (All ProgPoW-Compatible)
- **Modern**: RTX 40xx, RTX 30xx, RTX 20xx series
- **Mid-Range**: GTX 16xx, GTX 10xx series
- **Legacy**: GTX 9xx, GTX 7xx series (with limitations)

#### AMD (All ProgPoW-Compatible)
- **Modern**: RX 7000, RX 6000 series (RDNA 2/3)
- **Mid-Range**: RX 5000 series (RDNA 1)
- **Polaris**: RX 500, RX 400 series
- **Legacy**: R9 series, Vega series

### 🔮 Future Plans

- **SOAP Merge Mining**: Full implementation when available
- **Advanced Overclocking**: GUI-based overclocking interface
- **Remote Rig Discovery**: Automatic network discovery
- **Real-Time Updates**: WebSocket for live statistics

### 🙏 Acknowledgments

- Quai Network community for feedback
- GPU manufacturers for driver support
- Open source mining software developers

---

**Note**: This is a major version update. The project is now positioned as a complete mining operating system rather than just a toolkit.

