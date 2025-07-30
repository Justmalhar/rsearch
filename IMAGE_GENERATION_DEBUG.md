# Image Generation Debug Guide

## Issue Summary
The Pro and Ultra modes in the image generator were returning fewer images than expected. This has been resolved by updating the code to reflect the correct API limitations of each model.

## Root Cause Analysis

### Model-Specific Limitations
- **Fast Model**: Supports `num_outputs: 4`, `go_fast: true`, `guidance`, and other parameters
- **Pro Model**: Only supports `num_outputs: 1` and doesn't support `go_fast`, `guidance`, or `num_outputs > 1`
- **Ultra Model**: Only supports `num_outputs: 1` and doesn't support `go_fast`, `guidance`, or `num_outputs > 1`

### Previous Issue
The code was incorrectly trying to use unsupported parameters for Pro and Ultra models, which could cause API errors or unexpected behavior.

## Changes Made

### 1. Updated Model Configurations
```javascript
const MODEL_CONFIGS = {
  fast: {
    num_outputs: 4,
    num_inference_steps: 28,
    guidance: 3.5,
    prompt_strength: 0.8,
    go_fast: true
  },
  pro: {
    num_outputs: 1,
    num_inference_steps: 28,
    prompt_strength: 0.8
    // Note: Pro model doesn't support go_fast, guidance, or num_outputs > 1
  },
  ultra: {
    num_outputs: 1,
    num_inference_steps: 28,
    prompt_strength: 0.8
    // Note: Ultra model doesn't support go_fast, guidance, or num_outputs > 1
  }
};
```

### 2. Dynamic Parameter Selection
- Only includes supported parameters for each model
- Fast model gets all parameters including `go_fast`, `guidance`, and `num_outputs: 4`
- Pro and Ultra models only get the parameters they support

### 3. Updated User Interface
- Clear expectations set for each model
- Model descriptions now show the number of images generated
- Informative text explains the differences between models

### 4. Improved Error Handling
- Removed unnecessary resource constraint fallback logic
- Simplified prediction creation for Pro and Ultra models
- Better validation of expected vs actual image counts

## Expected Behavior

### Fast Model
- **Generates**: 4 images
- **Generation Time**: ~30 seconds
- **Features**: Supports all parameters including `go_fast` and `guidance`
- **Use Case**: Quick generation with multiple variations

### Pro Model
- **Generates**: 1 image
- **Generation Time**: ~60 seconds
- **Features**: Higher quality, balanced speed and quality
- **Use Case**: Single high-quality image generation

### Ultra Model
- **Generates**: 1 image
- **Generation Time**: ~90 seconds
- **Features**: Highest quality generation
- **Use Case**: Single highest-quality image generation

## API Parameters by Model

### Fast Model (`black-forest-labs/flux-dev`)
```javascript
{
  prompt: "enhanced prompt",
  go_fast: true,
  guidance: 3.5,
  num_outputs: 4,
  aspect_ratio: "1:1",
  output_format: "jpg",
  output_quality: 100,
  prompt_strength: 0.8,
  num_inference_steps: 28
}
```

### Pro Model (`black-forest-labs/flux-1.1-pro`)
```javascript
{
  prompt: "enhanced prompt",
  aspect_ratio: "1:1",
  output_format: "jpg",
  output_quality: 100,
  prompt_strength: 0.8,
  num_inference_steps: 28
}
```

### Ultra Model (`black-forest-labs/flux-1.1-pro-ultra`)
```javascript
{
  prompt: "enhanced prompt",
  aspect_ratio: "1:1",
  output_format: "jpg",
  output_quality: 100,
  prompt_strength: 0.8,
  num_inference_steps: 28
}
```

## Testing

### Run the Test Script
```bash
npm run test:images
```

This will now correctly test:
- Fast model: Expects 4 images
- Pro model: Expects 1 image
- Ultra model: Expects 1 image

### Manual Testing
1. Test each model with different prompts
2. Verify the correct number of images are generated
3. Check that no API errors occur
4. Confirm the UI shows the correct expectations

## Troubleshooting

### If Fast model returns fewer than 4 images:
1. Check server logs for API errors
2. Verify Replicate API status
3. Check account usage and billing

### If Pro/Ultra models return more than 1 image:
1. This should not happen with the current configuration
2. Check if the API has changed
3. Verify the model versions being used

### If any model fails to generate:
1. Check the enhanced logging output
2. Verify the prompt is valid
3. Check Replicate API status and account limits

## Configuration Options

### Adjusting Parameters
To modify generation parameters, update the `MODEL_CONFIGS` in `app/api/image/route.ts`:

```javascript
// For Fast model - can adjust all parameters
fast: {
  num_outputs: 4,  // Can be 1-4
  guidance: 3.5,   // Can be adjusted
  go_fast: true,   // Can be true/false
  // ... other parameters
}

// For Pro/Ultra models - limited parameters
pro: {
  num_outputs: 1,  // Must be 1
  // Cannot use guidance or go_fast
  // ... other supported parameters
}
```

## Monitoring

The enhanced logging will help track:
- Which parameters are being sent to each model
- Expected vs actual image counts
- Any API errors or unexpected responses
- User experience with different models

## Next Steps

1. **Deploy the updated code** to production
2. **Monitor logs** to ensure correct parameter usage
3. **Collect user feedback** on the different model behaviors
4. **Consider UI improvements** to better explain model differences
5. **Evaluate if additional models** are needed for different use cases