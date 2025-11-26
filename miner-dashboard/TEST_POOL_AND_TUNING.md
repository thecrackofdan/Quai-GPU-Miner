# Testing Pool & GPU Tuning Features

## Quick Test Checklist

### ✅ Files Verification
- [x] `public/pools.html` - Pool selection page
- [x] `public/gpu-tuner.html` - GPU tuning page
- [x] `public/js/pool-manager.js` - Pool management logic
- [x] `public/js/gpu-tuner.js` - GPU tuning logic
- [x] `public/js/pool-integration.js` - Integration script

### ✅ API Endpoints
- [x] `GET /api/pools` - List all pools
- [x] `GET /api/pools/recommended?hashRate=X` - Get recommended pool
- [x] `GET /api/gpu/list` - Get GPU list
- [x] `GET /api/gpu/:id/settings` - Get GPU settings
- [x] `POST /api/gpu/:id/settings` - Apply GPU settings
- [x] `POST /api/gpu/:id/reset` - Reset to optimal
- [x] `GET /api/gpu/presets` - Get presets
- [x] `POST /api/gpu/presets` - Save preset

### ✅ Integration Points
- [x] Pool selection in Miner Config modal
- [x] GPU tuning button in GPU section
- [x] Pool badge in header
- [x] JavaScript files loaded in index.html

## Testing Steps

### 1. Start the Server
```bash
cd miner-dashboard
npm start
```

### 2. Test Pool Selection
1. Open browser to `http://localhost:3000`
2. Click "Pools" badge in header → Should open `/pools.html`
3. Or click "Configure Miner" → Select "Pool Mining" mode
4. Pool dropdown should appear
5. Select a pool → Pool info should display
6. Pool URL should auto-fill

### 3. Test GPU Tuning
1. Click "Fine-Tune GPUs" button in GPU section
2. Should navigate to `/gpu-tuner.html`
3. GPU cards should display (if GPUs detected)
4. Settings sliders should work
5. Impact preview should update

### 4. Test API Endpoints
```bash
# Test pools endpoint
curl http://localhost:3000/api/pools

# Test recommended pool
curl http://localhost:3000/api/pools/recommended?hashRate=50

# Test GPU list
curl http://localhost:3000/api/gpu/list

# Test GPU settings (replace 0 with actual GPU ID)
curl http://localhost:3000/api/gpu/0/settings
```

### 5. Test Integration
1. Open Miner Config modal
2. Change mining mode to "Pool Mining"
3. Pool selection should appear
4. Select pool → Info displays
5. Save config → Should work

## Expected Behavior

### Pool Selection
- ✅ Pool dropdown shows all available pools
- ✅ Pool info displays when selected
- ✅ URL auto-fills in stratum input
- ✅ Can switch between solo and pool modes

### GPU Tuning
- ✅ GPU cards display for each GPU
- ✅ Settings sliders work
- ✅ Impact preview updates in real-time
- ✅ Test mode applies temporarily
- ✅ Reset button restores optimal settings

### API Responses
- ✅ All endpoints return JSON
- ✅ Success responses include `success: true`
- ✅ Error responses include error message
- ✅ Mock API handles missing QuaiMiner OS gracefully

## Known Limitations

1. **Mock API**: When QuaiMiner OS is not installed, GPU methods return mock responses
2. **GPU Detection**: Requires QuaiMiner OS for real GPU detection
3. **Settings Application**: Requires QuaiMiner OS for actual GPU control

## Troubleshooting

### Pool Selection Not Working
- Check browser console for JavaScript errors
- Verify `pool-manager.js` is loaded
- Check API endpoint `/api/pools` returns data

### GPU Tuning Not Working
- Check browser console for errors
- Verify `gpu-tuner.js` is loaded
- Check `/api/gpu/list` returns GPU data
- If no GPUs, mock API returns empty array

### API Errors
- Check server logs for errors
- Verify database is accessible
- Check minerAPI is properly initialized

## Success Criteria

✅ All files exist and are accessible
✅ API endpoints return valid JSON
✅ UI elements are interactive
✅ Pool selection works in modal
✅ GPU tuning page loads
✅ Integration scripts execute without errors

