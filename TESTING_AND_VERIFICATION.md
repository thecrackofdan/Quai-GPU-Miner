# Testing and Verification Guide

## Overview

This document provides comprehensive testing procedures for all new features added to QuaiMiner CORE OS.

## 1. Mining Insights Widget Testing ✅

### Test Steps:
1. **Open Dashboard**
   - Navigate to `http://localhost:3000`
   - Wait for dashboard to load completely

2. **Locate Insights Widget**
   - Scroll to "Mining Insights & Analytics" section
   - Widget should appear below "My Mining Performance"

3. **Verify Widget Display**
   - ✅ Widget should show "Loading insights and analytics..." initially
   - ✅ After 2-3 seconds, should display profitability cards
   - ✅ Cards should have proper styling (borders, colors)

4. **Test Profitability Analysis**
   - ✅ Should show Daily Profit (green if positive, red if negative)
   - ✅ Should show Profit Margin percentage
   - ✅ Should show Efficiency (MH/s per Watt)

5. **Test ROI Calculator**
   - ✅ Should show Days to ROI
   - ✅ Should show 30/90/365-day ROI percentages
   - ✅ Should calculate based on hardware cost

6. **Test Earnings Projections**
   - ✅ Should show hourly, daily, weekly, monthly, yearly projections
   - ✅ Values should be calculated correctly

7. **Test Optimization Insights**
   - ✅ Should show actionable insights
   - ✅ Should have action buttons for each insight
   - ✅ Insights should be color-coded (warning, error, info)

8. **Test Refresh Button**
   - ✅ Click "🔄 Refresh" button
   - ✅ Should update all insights
   - ✅ Should show success toast message

### Expected Results:
- All metrics display correctly
- Calculations are accurate
- UI is responsive and beautiful
- Action buttons work

## 2. Automatic Pool Switching Testing ✅

### Test Steps:
1. **Enable Auto-Switching**
   - Open Miner Configuration modal
   - Select "Pool Mining" mode
   - Look for "Enable Automatic Pool Switching" checkbox
   - ✅ Checkbox should be available

2. **Test Auto-Switch Toggle**
   - ✅ Check the checkbox
   - ✅ Should show success toast
   - ✅ Should log "Automatic pool switching enabled"
   - ✅ Uncheck the checkbox
   - ✅ Should show info toast
   - ✅ Should log "Automatic pool switching disabled"

3. **Test Pool Monitoring**
   - ✅ System should monitor pools every 5 minutes
   - ✅ Should update pool statistics (latency, uptime)
   - ✅ Check browser console for monitoring logs

4. **Test Automatic Switch**
   - Set up two pools with different fees
   - Enable auto-switching
   - ✅ System should detect better pool
   - ✅ Should switch when 5% improvement detected
   - ✅ Should show notification
   - ✅ Should log switch in history

### Expected Results:
- Auto-switching works correctly
- Notifications appear
- Switch history is maintained
- No excessive switching

## 3. Pool Comparison Table Testing ✅

### Test Steps:
1. **Access Pool Selection**
   - Click "📊 Pools" in header or navigate to `/pools.html`
   - ✅ Should show pool comparison table

2. **Verify Table Content**
   - ✅ Should show all pools (Solo, Official, QuaiMiner, QuaiHash)
   - ✅ Should display Fee, Payout, Min Payout, Uptime, Best For columns
   - ✅ Data should be accurate

3. **Test Pool Cards**
   - ✅ Each pool should have a detailed card
   - ✅ Cards should show all features
   - ✅ "Select This Pool" buttons should be visible

4. **Test Recommendations**
   - ✅ Solo mining should show "Recommended for Large Miners"
   - ✅ Official pool should show "Official" badge
   - ✅ Recommended pools should be highlighted

### Expected Results:
- Table displays correctly
- All pool information is accurate
- Cards are visually appealing
- Recommendations are clear

## 4. One-Click Pool Connection Testing ✅

### Test Steps:
1. **From Pool Selection Page**
   - Go to `/pools.html`
   - Click "Select This Pool" on any pool card
   - ✅ Should prompt for wallet address
   - ✅ Enter valid wallet address (0x followed by 40 hex chars)
   - ✅ Should connect to pool
   - ✅ Should redirect to dashboard
   - ✅ Should show success message

2. **From Dashboard**
   - Open Miner Configuration modal
   - Select "Pool Mining" mode
   - Select pool from dropdown
   - ✅ Pool info should display
   - ✅ Stratum address should auto-fill
   - ✅ Click "Save Configuration"
   - ✅ Should save successfully

3. **Test Invalid Wallet**
   - Try to connect with invalid wallet address
   - ✅ Should show error message
   - ✅ Should not connect

4. **Test Solo Mining Selection**
   - Click "Select Solo Mining" on pools page
   - ✅ Should redirect to dashboard
   - ✅ Should open config modal
   - ✅ Should set mode to "solo"

### Expected Results:
- One-click connection works
- Wallet validation works
- Error handling is proper
- User feedback is clear

## 5. Optimization Suggestions Testing ✅

### Test Steps:
1. **Check Insight Suggestions**
   - Open dashboard
   - Wait for insights to load
   - ✅ Should show optimization insights section

2. **Test Low Efficiency Insight**
   - Set low hash rate or high power usage
   - ✅ Should show "Low Mining Efficiency" insight
   - ✅ Should have "Optimize GPU Settings" button
   - ✅ Click button should open GPU tuner

3. **Test Unprofitable Insight**
   - Set high power cost or low earnings
   - ✅ Should show "Mining Not Profitable" insight
   - ✅ Should have "Review Settings" button
   - ✅ Click button should open settings

4. **Test High Pool Fee Insight**
   - Connect to pool with >1% fee
   - ✅ Should show "High Pool Fee" insight
   - ✅ Should have "Switch Pool" button
   - ✅ Click button should open pool selection

5. **Test Break-Even Insight**
   - Set hash rate below break-even
   - ✅ Should show "Below Break-Even Hash Rate" insight
   - ✅ Should have "Optimize Performance" button

### Expected Results:
- Insights appear correctly
- Action buttons work
- Suggestions are relevant
- Actions are executed properly

## Integration Testing

### Test Complete Flow:
1. **New User Flow**
   - Open dashboard for first time
   - ✅ Insights should load automatically
   - ✅ Pool manager should initialize
   - ✅ All widgets should display

2. **Pool Switching Flow**
   - Start with one pool
   - Enable auto-switching
   - ✅ Should monitor pools
   - ✅ Should switch when better pool found
   - ✅ Dashboard should update

3. **Insights Update Flow**
   - Start mining
   - ✅ Insights should update every minute
   - ✅ Metrics should reflect current performance
   - ✅ Suggestions should update based on data

## Browser Compatibility

### Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

## Mobile Responsiveness

### Test on:
- ✅ Mobile devices (320px+ width)
- ✅ Tablets (768px+ width)
- ✅ Desktop (1024px+ width)

## Performance Testing

### Verify:
- ✅ Insights load within 2-3 seconds
- ✅ Pool monitoring doesn't slow down dashboard
- ✅ Auto-switching doesn't cause lag
- ✅ No memory leaks

## Error Handling

### Test:
- ✅ Network errors (offline mode)
- ✅ Invalid API responses
- ✅ Missing data
- ✅ Invalid wallet addresses
- ✅ Pool connection failures

## Known Issues

None currently identified.

## Test Results Template

```
Date: ___________
Tester: ___________

Mining Insights Widget: [ ] Pass [ ] Fail
Automatic Pool Switching: [ ] Pass [ ] Fail
Pool Comparison Table: [ ] Pass [ ] Fail
One-Click Connection: [ ] Pass [ ] Fail
Optimization Suggestions: [ ] Pass [ ] Fail

Notes:
_______________________________________
_______________________________________
```

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance if needed
3. Add additional features based on feedback
4. Update documentation

