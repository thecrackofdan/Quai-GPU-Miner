# Quick Start - Competitive Features

## 🚀 New Features Available

QuaiMiner CORE OS now includes competitive features matching HiveOS, Minerstat, and Awesome Miner!

## 📋 Quick Access

### From Dashboard Header

1. **🔔 Alerts** - Configure multi-channel alerting
2. **📋 Profiles** - Manage flight sheets (mining profiles)
3. **🔗 Merged Mining** - Setup merged mining wizard
4. **⚙️ Configure** - Miner configuration

## 🔔 Setting Up Alerts

### Step 1: Open Alerts Configuration
- Click "🔔 Alerts" button in dashboard header

### Step 2: Configure Channels

#### Email Alerts
1. Enable "Email Alerts"
2. Enter SMTP settings:
   - Host: `smtp.gmail.com` (for Gmail)
   - Port: `587`
   - Username: Your email
   - Password: App password (not regular password)
   - Recipients: Comma-separated email addresses

#### Telegram Alerts
1. Enable "Telegram Alerts"
2. Create bot:
   - Message @BotFather on Telegram
   - Send `/newbot` and follow instructions
   - Copy bot token
3. Get Chat ID:
   - Message @userinfobot on Telegram
   - Copy your chat ID
4. Enter bot token and chat ID
5. Test alert

#### Discord Alerts
1. Enable "Discord Alerts"
2. Create webhook:
   - Discord Server → Settings → Integrations → Webhooks
   - Create new webhook
   - Copy webhook URL
3. Paste webhook URL
4. Test alert

### Step 3: Configure Alert Rules
- Default rules are pre-configured
- Enable/disable rules as needed
- Rules include:
  - Hash rate drop
  - High temperature
  - Miner crash
  - Block found
  - GPU failure

### Step 4: Save & Test
- Click "Save Alert Configuration"
- Click "Test Alerts" to verify

## 📋 Using Flight Sheets

### Step 1: Open Flight Sheets
- Click "📋 Profiles" button in dashboard header

### Step 2: Create a Profile
1. Click "+ Create New Flight Sheet"
2. Enter name (e.g., "High Performance")
3. Enter description (optional)
4. Profile saves current miner configuration

### Step 3: Apply a Profile
1. View all profiles in list
2. Click "Apply" on desired profile
3. Miner restarts with new configuration
4. Active profile is highlighted

### Step 4: Manage Profiles
- **Edit**: Modify profile settings
- **Delete**: Remove unused profiles
- **Apply**: Switch to profile instantly

## 🔄 Auto-Reboot Watchdog

### Setup (One Time)

```bash
# Navigate to quaiminer-os directory
cd quaiminer-os

# Copy watchdog script
sudo cp auto-reboot-watchdog.sh /opt/quaiminer/
sudo chmod +x /opt/quaiminer/auto-reboot-watchdog.sh

# Install systemd service
sudo cp quaiminer-watchdog.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable quaiminer-watchdog
sudo systemctl start quaiminer-watchdog
```

### Monitor Watchdog

```bash
# Check status
sudo systemctl status quaiminer-watchdog

# View logs
sudo journalctl -u quaiminer-watchdog -f

# View log file
tail -f /var/log/quaiminer/watchdog.log
```

### What It Monitors

- ✅ Miner process running
- ✅ GPU temperature (< 85°C)
- ✅ Hash rate (> 1 MH/s)
- ✅ Network connectivity
- ✅ Auto-restart on issues
- ✅ System reboot if needed

## 💰 Profit Optimizer

### Enable Auto-Switching

1. Find "💰 Auto Profit Optimizer" widget on dashboard
2. Toggle "Enable Auto-Switching"
3. System automatically:
   - Monitors all Quai chains
   - Calculates profitability
   - Switches to best chain
   - Only switches if improvement > 5%

### View Chain Comparison

- See profitability for each chain
- Current best chain highlighted
- Real-time updates every 5 minutes

## 🏭 Multi-Rig Management

### Add a Rig

1. Rig must have QuaiMiner CORE OS installed
2. Note rig's IP address
3. Add via API or configuration

### Remote Control

- View all rigs in one place
- Start/stop/restart remotely
- Monitor status in real-time
- View per-rig statistics

## 📊 Feature Comparison

| Feature | Status | Access |
|---------|--------|--------|
| **Advanced Alerting** | ✅ Ready | 🔔 Alerts button |
| **Flight Sheets** | ✅ Ready | 📋 Profiles button |
| **Auto-Reboot** | ✅ Ready | Systemd service |
| **Profit Optimizer** | ✅ Ready | Dashboard widget |
| **Multi-Rig** | ✅ Ready | Dashboard widget |

## 🎯 Common Use Cases

### Use Case 1: High Temperature Alert
1. Open Alerts configuration
2. Enable "High Temperature" rule
3. Configure Telegram/Discord
4. Set threshold (default 80°C)
5. Receive alerts when GPU gets hot

### Use Case 2: Quick Profile Switch
1. Create "Efficient" profile (lower power)
2. Create "Performance" profile (max hash rate)
3. Switch between profiles based on:
   - Electricity costs (off-peak = Performance)
   - Temperature (hot day = Efficient)
   - Time of day

### Use Case 3: Auto-Recovery
1. Install watchdog service
2. Configure thresholds
3. System auto-recovers from:
   - Miner crashes
   - High temperatures
   - Network issues
   - GPU failures

## 🔧 Troubleshooting

### Alerts Not Sending

1. **Email**: Check SMTP settings, use app password
2. **Telegram**: Verify bot token and chat ID
3. **Discord**: Check webhook URL is correct
4. **Test**: Use "Test Alerts" button

### Flight Sheets Not Applying

1. Check miner is running
2. Verify configuration is valid
3. Check system logs
4. Try manual restart

### Watchdog Not Working

1. Check service status: `sudo systemctl status quaiminer-watchdog`
2. View logs: `sudo journalctl -u quaiminer-watchdog`
3. Verify script permissions: `ls -l /opt/quaiminer/auto-reboot-watchdog.sh`
4. Check config file exists: `ls -l /etc/quaiminer/config.json`

## 📝 Next Steps

1. **Configure Alerts** - Set up your preferred channels
2. **Create Profiles** - Make profiles for different scenarios
3. **Enable Watchdog** - Install auto-reboot service
4. **Test Everything** - Verify all features work
5. **Enjoy** - Your mining OS is now competitive with HiveOS!

## 🎉 You're All Set!

QuaiMiner CORE OS now has all the competitive features you need, plus unique Quai Network advantages!

