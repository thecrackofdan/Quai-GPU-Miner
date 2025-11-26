# Mobile Dashboard - Remote Access Guide

## Overview

The QuaiMiner CORE OS Mobile Dashboard provides a mobile-optimized interface for remote monitoring and control of your mining rigs.

## Features

### 📱 Mobile-Optimized
- Touch-friendly interface
- Responsive design for all screen sizes
- Fast loading on mobile networks
- Offline-capable (PWA)

### 🌐 Remote Access
- Connect to rigs over network
- Configurable server URL
- Works on any device with a browser
- No app installation required

### ⚡ Key Features
- Real-time mining statistics
- GPU monitoring
- Network status
- Mining controls (start/stop/restart)
- Quick actions
- Settings management

## Access Methods

### Method 1: Direct URL
Navigate to: `http://YOUR-RIG-IP:3000/mobile.html`

### Method 2: Auto-Detection
If accessing from the same network, the dashboard will auto-detect the server URL.

### Method 3: Manual Configuration
1. Open Settings section
2. Enter your rig's IP address and port
3. Click "Save & Connect"

## Usage

### Dashboard Section
- View key mining statistics
- Monitor hash rate, shares, temperature, power
- See mining status and uptime
- Quick GPU overview

### GPUs Section
- Detailed GPU information
- Per-GPU statistics
- Temperature and power monitoring
- Fan speed tracking

### Network Section
- Node sync status
- Block height
- Network hash rate
- Peer count

### Mining Section
- Start/Stop mining
- Restart miner
- View logs
- Quick actions

### Settings Section
- Configure server URL
- Set update interval
- View version information

## Mobile Features

### Touch Gestures
- Tap to interact
- Swipe to navigate (coming soon)
- Pull to refresh (coming soon)

### PWA Support
- Install as app on home screen
- Works offline (cached)
- Push notifications (coming soon)

### Performance
- Optimized for mobile networks
- Efficient data updates
- Minimal bandwidth usage
- Fast loading times

## Configuration

### Server URL
Default: `http://localhost:3000`

For remote access, use your rig's IP address:
- `http://192.168.1.100:3000` (local network)
- `http://your-domain.com:3000` (if configured)

### Update Interval
- 5 seconds (default)
- 10 seconds
- 30 seconds
- 1 minute

Choose based on:
- Mobile data usage
- Battery life
- Network speed

## Security

### Network Security
- Use HTTPS in production
- Configure firewall rules
- Use VPN for remote access
- Set up authentication

### Best Practices
1. **Local Network**: Access via local IP when on same network
2. **Remote Access**: Use VPN or secure tunnel
3. **Authentication**: Enable authentication on server
4. **HTTPS**: Use SSL/TLS certificates

## Troubleshooting

### Connection Issues
1. Check server is running
2. Verify IP address and port
3. Check firewall settings
4. Test with desktop browser first

### Performance Issues
1. Increase update interval
2. Check network speed
3. Close other apps
4. Use WiFi instead of mobile data

### Display Issues
1. Clear browser cache
2. Refresh page
3. Check browser compatibility
4. Try different browser

## Browser Compatibility

### Recommended
- Chrome/Edge (Android)
- Safari (iOS)
- Firefox Mobile

### Minimum Requirements
- Modern browser with ES6 support
- JavaScript enabled
- Local storage enabled

## Installation as App

### Android (Chrome)
1. Open mobile dashboard
2. Tap menu (3 dots)
3. Select "Add to Home Screen"
4. Launch from home screen

### iOS (Safari)
1. Open mobile dashboard
2. Tap Share button
3. Select "Add to Home Screen"
4. Launch from home screen

## API Endpoints Used

- `GET /api/stats` - Mining statistics
- `POST /api/miner/start` - Start mining
- `POST /api/miner/stop` - Stop mining
- `GET /api/miner/logs` - View logs

## Future Enhancements

- [ ] Push notifications
- [ ] Offline mode with sync
- [ ] Swipe gestures
- [ ] Dark/light theme toggle
- [ ] Widget support
- [ ] Multi-rig switching
- [ ] Alert management
- [ ] Chart visualizations

## Support

For issues or questions:
- Check server logs
- Verify network connectivity
- Review server configuration
- Check browser console for errors

## Privacy

The mobile dashboard:
- ✅ No data collection
- ✅ No tracking
- ✅ Local storage only
- ✅ Direct connection to your rig
- ✅ No third-party services

**Your data stays on your network!**

