# Quick Start Guide - Testing All Features

## Prerequisites

1. **Start the server**:
   ```bash
   cd miner-dashboard
   npm install  # If not already done
   npm start
   ```

2. **Open browser**: Navigate to `http://localhost:3000`

## Testing Checklist

### ✅ 1. Mining Insights Widget

**Location**: Dashboard main page, below "My Mining Performance"

**Steps**:
1. Open dashboard
2. Scroll to "📊 Mining Insights & Analytics" section
3. Wait 2-3 seconds for data to load
4. Verify you see:
   - 💰 Profitability Analysis card (green if profitable, red if not)
   - 📊 ROI Analysis card
   - 📈 Earnings Projections card
   - 💡 Optimization Insights (if any issues detected)

**Test Actions**:
- Click "🔄 Refresh" button → Should update all metrics
- Click action buttons in insights → Should open relevant modals

### ✅ 2. Pool Selection & Comparison

**Location**: Click "📊 Pools" in header or go to `/pools.html`

**Steps**:
1. Navigate to pools page
2. View comparison table
3. Review pool cards:
   - Solo Mining (Your Node)
   - Quai Network Official Pool
   - QuaiMiner Pool
   - QuaiHash Pool

**Test Actions**:
- Click "Select This Pool" on any pool
- Enter wallet address when prompted (format: `0x` + 40 hex characters)
- Should connect and redirect to dashboard

### ✅ 3. One-Click Pool Connection

**From Dashboard**:
1. Click "⚙️ Configure" button
2. Select "Pool Mining" mode
3. Choose pool from dropdown
4. Pool info should auto-fill
5. Click "Save Configuration"

**From Pools Page**:
1. Click "Select This Pool"
2. Enter wallet address
3. Should connect automatically

### ✅ 4. Automatic Pool Switching

**Steps**:
1. Open Miner Configuration modal
2. Select "Pool Mining" mode
3. Look for "Enable Automatic Pool Switching" checkbox
4. Check the box
5. Should see success notification
6. System will monitor pools every 5 minutes
7. Will automatically switch if 5%+ improvement detected

**Verify**:
- Checkbox state persists after page refresh
- Monitoring runs in background
- Switches are logged in dashboard logs

### ✅ 5. Optimization Suggestions

**Steps**:
1. Open dashboard
2. Wait for insights to load
3. Check "💡 Optimization Insights" section
4. Review suggestions:
   - Low efficiency → "Optimize GPU Settings" button
   - Unprofitable → "Review Settings" button
   - High pool fee → "Switch Pool" button
   - Below break-even → "Optimize Performance" button

**Test Actions**:
- Click each action button
- Should open relevant modal/feature
- Should execute suggested action

## Expected Results

### Insights Widget
- ✅ Displays profitability metrics
- ✅ Shows ROI calculations
- ✅ Projects earnings
- ✅ Provides optimization suggestions
- ✅ Updates every minute automatically

### Pool Manager
- ✅ Shows all available pools
- ✅ Provides smart recommendations
- ✅ Enables one-click connection
- ✅ Supports automatic switching
- ✅ Tracks switch history

### User Experience
- ✅ Smooth transitions
- ✅ Clear notifications
- ✅ Error handling
- ✅ Loading states

## Troubleshooting

### Insights Not Loading
- Check browser console (F12) for errors
- Verify server is running
- Check network tab for API calls

### Pool Connection Fails
- Verify wallet address format (0x + 40 hex chars)
- Check server logs for errors
- Verify pool URL is correct

### Auto-Switch Not Working
- Verify checkbox is checked
- Check browser console for errors
- Verify pool monitoring is running

## Success Criteria

✅ All features load without errors  
✅ Insights display correct calculations  
✅ Pool selection works smoothly  
✅ One-click connection succeeds  
✅ Auto-switching can be enabled  
✅ Optimization suggestions appear  
✅ Action buttons work correctly  

## Next Steps

After testing:
1. Review any issues found
2. Optimize performance if needed
3. Add additional features based on feedback
4. Update documentation

**Status**: ✅ All features implemented and ready for testing!

