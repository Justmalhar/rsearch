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
    // Note: Pro model doesn't support go_fast, guidance, num_outputs, num_inference_steps, or prompt_strength
  },
  ultra: {
    // Note: Ultra model doesn't support go_fast, guidance, num_outputs, num_inference_steps, or prompt_strength
  }
} as const;

// Type for Fast model config
type FastModelConfig = typeof MODEL_CONFIGS.fast;

// Type for input parameters
type InputParams = {
  prompt: string;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
  go_fast?: boolean;
  guidance?: number;
  num_outputs?: number;
  prompt_strength?: number;
  num_inference_steps?: number;
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
  output_quality: 100
}
```

### Ultra Model (`black-forest-labs/flux-1.1-pro-ultra`)
```javascript
{
  prompt: "enhanced prompt",
  aspect_ratio: "1:1",
  output_format: "jpg",
  output_quality: 100
}
```

## API Response Formats

### Fast Model Response
```javascript
{
  status: "succeeded",
  output: [
    "https://replicate.delivery/.../image1.jpg",
    "https://replicate.delivery/.../image2.jpg",
    "https://replicate.delivery/.../image3.jpg",
    "https://replicate.delivery/.../image4.jpg"
  ]
}
```

### Pro/Ultra Model Response
```javascript
{
  status: "succeeded",
  output: "https://replicate.delivery/.../image.jpg"
}
```

### Frontend Handling
The frontend code handles both response formats:
```javascript
// Handle both single URL (Pro/Ultra) and array of URLs (Fast)
const outputArray = Array.isArray(data.output) ? data.output : [data.output];
const generatedImages = outputArray.map((url: string, index: number) => ({
  url,
  id: `${id}-${index}`,
}));
```

## Testing

### Run the Test Script
```bash
npm run test:images
```

This will now correctly test:
- Fast model: Expects 4 images (array response)
- Pro model: Expects 1 image (single URL response)
- Ultra model: Expects 1 image (single URL response)

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

### If frontend shows "map is not a function" error:
1. This indicates the API is returning a single URL instead of an array
2. The fix is already implemented to handle both formats
3. Check the console logs to see the actual response format

## Configuration Options

### Adjusting Parameters
To modify generation parameters, update the `MODEL_CONFIGS` in `app/api/image/route.ts`:

```javascript
// For Fast model - can adjust all parameters
fast: {
  num_outputs: 4,  // Can be 1-4
  guidance: 3.5,   // Can be adjusted
  go_fast: true,   // Can be true/false
  prompt_strength: 0.8,  // Can be adjusted
  num_inference_steps: 28  // Can be adjusted
  // ... other parameters
}

// For Pro/Ultra models - no configurable parameters
pro: {
  // No configurable parameters - uses only base input
}
ultra: {
  // No configurable parameters - uses only base input
}
```

## Monitoring

The enhanced logging will help track:
- Which parameters are being sent to each model
- Expected vs actual image counts
- Response format (array vs single URL)
- Any API errors or unexpected responses
- User experience with different models

## Next Steps

1. **Deploy the updated code** to production
2. **Monitor logs** to ensure correct parameter usage
3. **Collect user feedback** on the different model behaviors
4. **Consider UI improvements** to better explain model differences
5. **Evaluate if additional models** are needed for different use cases