# Remote Access & Download Guide

## Overview

The QuaiMiner CORE OS website now serves as a comprehensive remote access point with download instructions and connection management.

## Access Points

### 1. Landing Page (Default)
**URL**: `http://YOUR-RIG-IP:3000/` or `http://YOUR-RIG-IP:3000/remote.html`

**Features**:
- Download instructions for all installation methods
- Quick access to dashboard and mobile views
- Remote connection setup
- System requirements
- Quick start guide
- Support links

### 2. Full Dashboard
**URL**: `http://YOUR-RIG-IP:3000/dashboard` or `http://YOUR-RIG-IP:3000/index.html`

**Features**:
- Complete mining dashboard
- Real-time statistics
- GPU monitoring
- Advanced features
- Charts and historical data

### 3. Mobile Dashboard
**URL**: `http://YOUR-RIG-IP:3000/mobile.html`

**Features**:
- Mobile-optimized interface
- Touch-friendly controls
- Remote access support
- PWA installable

## Download Options

### USB Bootable Image (Recommended)
- **Size**: ~2GB
- **Format**: ISO
- **Platform**: Linux x64
- **Best for**: Fresh installations, dedicated mining rigs

**Installation Steps**:
1. Download ISO image
2. Flash to USB drive
3. Boot from USB
4. Automatic setup
5. Access dashboard

### Automated Installer
- **Size**: ~50MB
- **Format**: Shell Script
- **Platform**: Linux (Ubuntu/Debian)
- **Best for**: Existing Linux systems

**Installation Steps**:
1. Download installer script
2. Make executable
3. Run with sudo
4. Automatic hardware detection
5. Automatic configuration

### Docker Container
- **Size**: ~500MB
- **Format**: Docker Image
- **Platform**: Any (Docker)
- **Best for**: Containerized deployments

**Installation Steps**:
1. Pull Docker image
2. Run container with GPU support
3. Access dashboard
4. Configure mining

## Remote Connection Setup

### Method 1: Direct IP Access
1. Find your rig's IP address
2. Navigate to `http://RIG-IP:3000`
3. Access landing page or dashboard

### Method 2: Connection Modal
1. Click "Connect to Rig" button
2. Enter rig IP address or domain
3. Optionally name the rig
4. Click "Connect"
5. Redirected to dashboard

### Method 3: URL Parameter
Access dashboard directly with rig URL:
```
http://localhost:3000/dashboard?rig=http://RIG-IP:3000
```

## System Requirements

### Hardware
- AMD or NVIDIA GPU
- 4GB RAM minimum
- 10GB free disk space
- USB 2.0+ port (for bootable)
- Network connection

### Software
- Linux kernel 5.4+
- AMD: ROCm 5.0+ or Mesa
- NVIDIA: Driver 470+
- Quai Network node (for solo mining)

### Network
- Internet connection
- Port 3000 (dashboard)
- Port 8545 (Quai node RPC)
- Port 3333 (stratum proxy)

## Security Considerations

### Local Network Access
- Access from same network: `http://RIG-IP:3000`
- No additional security needed
- Fast and reliable

### Remote Access (Outside Network)
**Recommended Methods**:
1. **VPN** (Most Secure)
   - Set up VPN server
   - Connect to VPN
   - Access via local IP

2. **SSH Tunnel**
   ```bash
   ssh -L 3000:localhost:3000 user@rig-ip
   ```
   Then access: `http://localhost:3000`

3. **Port Forwarding**
   - Configure router port forwarding
   - Use dynamic DNS
   - Access via domain name

4. **Firewall Rules**
   - Only allow specific IPs
   - Use strong authentication
   - Enable HTTPS (recommended)

## Quick Start

1. **Download** - Choose installation method
2. **Install** - Follow installation instructions
3. **Configure** - Set up Quai node and wallet
4. **Start Mining** - Click "Start Mining" in dashboard
5. **Monitor** - Access remotely from any device

## Features

### Landing Page
- ✅ Download instructions for all methods
- ✅ System requirements
- ✅ Quick start guide
- ✅ Remote access information
- ✅ Support links
- ✅ Connection setup

### Dashboard
- ✅ Real-time monitoring
- ✅ GPU statistics
- ✅ Network information
- ✅ Mining controls
- ✅ Historical charts
- ✅ Advanced features

### Mobile
- ✅ Touch-optimized
- ✅ Remote access
- ✅ PWA installable
- ✅ Quick actions
- ✅ Settings management

## Troubleshooting

### Can't Access Remotely
1. Check firewall settings
2. Verify port 3000 is open
3. Confirm rig IP address
4. Test with local network first
5. Check server is running

### Connection Issues
1. Verify server URL is correct
2. Check network connectivity
3. Try different browser
4. Clear browser cache
5. Check server logs

### Download Problems
1. Verify internet connection
2. Check disk space
3. Verify checksums
4. Try different download method
5. Check GitHub releases page

## Support

- **Documentation**: GitHub repository
- **Community**: Discord server
- **Issues**: GitHub Issues
- **Email**: (if provided)

## Privacy

- ✅ No tracking
- ✅ No data collection
- ✅ Direct connection
- ✅ Local storage only
- ✅ Your data stays on your network

