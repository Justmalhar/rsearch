# Image Generation Debug Guide

## Issue Summary
The Pro and Ultra modes in the image generator are returning fewer images than expected (1 image instead of 4).

## Root Cause Analysis

### Current Configuration
- **All models** are configured to generate **4 images** (`num_outputs: 4`)
- The code is correctly set up to handle multiple images
- Frontend properly displays multiple images in a grid

### Potential Causes

1. **Resource Constraints**: Pro and Ultra models are more resource-intensive and may fail to generate all 4 images during high demand
2. **API Rate Limits**: Replicate may throttle requests for higher-tier models
3. **Model-Specific Limitations**: Some models might have different behavior than documented
4. **Generation Failures**: Individual images within a batch may fail silently

## Changes Made

### 1. Enhanced Logging
- Added comprehensive logging in both frontend and backend
- Logs model selection, configuration, and API responses
- Tracks the number of images returned vs expected

### 2. Better Error Handling
- Added resource constraint detection and fallback
- Automatic retry with reduced parameters if resources are limited
- Graceful degradation when fewer images are generated

### 3. User Experience Improvements
- Informative messages when fewer images are generated
- Clear expectations set in the UI
- Better feedback during generation process

### 4. Model-Specific Configuration
- Separated configuration by model type
- Allows for model-specific optimizations
- Easier to adjust parameters per model

## Debugging Steps

### 1. Run the Test Script
```bash
npm run test:images
```

This will test all three models and provide detailed output about:
- Request creation success/failure
- Number of images generated per model
- Any errors or timeouts

### 2. Check Console Logs
When generating images, check the browser console and server logs for:
- Model configuration being used
- API request parameters
- Response status and output length
- Any error messages

### 3. Monitor Network Requests
Use browser dev tools to monitor:
- API request payloads
- Response data structure
- Timing of requests

## Expected Behavior

### Fast Model
- Should generate 4 images consistently
- Faster generation time (~30 seconds)
- Lower resource requirements

### Pro Model
- Should generate 4 images (may be 2-4 during high demand)
- Medium generation time (~60 seconds)
- Higher resource requirements

### Ultra Model
- Should generate 4 images (may be 2-4 during high demand)
- Longer generation time (~90 seconds)
- Highest resource requirements

## Troubleshooting

### If Pro/Ultra return only 1 image:

1. **Check server logs** for resource constraint errors
2. **Verify Replicate API status** and account limits
3. **Test with different prompts** to rule out prompt-specific issues
4. **Check account usage** and billing status

### If all models return fewer images:

1. **Verify REPLICATE_API_TOKEN** is valid and has sufficient credits
2. **Check network connectivity** to Replicate API
3. **Review Replicate documentation** for any recent changes
4. **Test with Replicate's direct API** to isolate the issue

## Configuration Options

### Adjusting Output Count
To change the number of images generated, modify the `MODEL_CONFIGS` in `app/api/image/route.ts`:

```javascript
const MODEL_CONFIGS = {
  fast: {
    num_outputs: 4,  // Change this value
    // ... other settings
  },
  pro: {
    num_outputs: 4,  // Change this value
    // ... other settings
  },
  ultra: {
    num_outputs: 4,  // Change this value
    // ... other settings
  }
};
```

### Adjusting Quality vs Speed
Modify inference steps and guidance for different quality/speed trade-offs:

```javascript
// Higher quality, slower generation
num_inference_steps: 40,
guidance: 4.0,

// Lower quality, faster generation
num_inference_steps: 20,
guidance: 3.0,
```

## Monitoring and Alerts

The enhanced logging will help identify:
- Which models are consistently returning fewer images
- Peak usage times when resource constraints occur
- API response patterns and failures
- User experience impact

## Next Steps

1. **Deploy the enhanced logging** to production
2. **Monitor logs** for patterns in Pro/Ultra model behavior
3. **Collect user feedback** on image generation experience
4. **Consider implementing** model-specific fallback strategies
5. **Evaluate alternative models** if issues persist