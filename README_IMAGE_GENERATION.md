# Image Generation Feature

This document describes the image generation functionality implemented in the rSearch application.

## Overview

The image generation feature allows users to create AI-generated images using various Flux models. The implementation properly handles the `num_outputs` parameter based on the selected model type.

## Models Supported

### Single Image Models (Flux Pro & Ultra)
- **flux-pro**: High-quality single image generation
- **flux-ultra**: Ultra-high quality single image generation

These models only generate one image per request and **do not accept the `num_outputs` parameter**.

### Multi-Image Models (Flux Standard)
- **flux-standard**: Standard quality image generation with multiple outputs support

This model supports generating 1-4 images per request and accepts the `num_outputs` parameter.

## Key Implementation Details

### Frontend (`/app/image/page.tsx`)

The frontend automatically:
- Hides the "Number of Images" slider when a single-image model is selected
- Shows an informational message for single-image models
- Only sends the `num_outputs` parameter for multi-image models

### Backend (`/app/api/image/route.ts`)

The API route implements the following logic:

```typescript
// Only include num_outputs for models that support multiple images
if (!modelConfig.singleImage) {
  // Validate and include num_outputs for multi-image models
  if (num_outputs !== undefined) {
    payload.num_outputs = num_outputs;
  }
} else {
  // For single image models, ensure num_outputs is not included
  if (num_outputs !== undefined) {
    console.warn(`num_outputs parameter ignored for single image model: ${model}`);
  }
}
```

## Environment Variables Required

Add these to your `.env.local` file:

```bash
IMAGE_GENERATION_API_KEY=your_api_key_here
IMAGE_GENERATION_BASE_URL=https://api.openai.com
```

## Usage

1. Navigate to `/image` in the application
2. Enter your image prompt
3. Select a model:
   - Choose **Flux Pro** or **Flux Ultra** for single high-quality images
   - Choose **Flux Standard** for multiple images (1-4)
4. Adjust the number of images slider (only available for Flux Standard)
5. Click "Generate Image"

## API Endpoints

### POST `/api/image`
Generates images based on the provided parameters.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "flux-pro",
  "num_outputs": 1  // Only included for multi-image models
}
```

**Response:**
```json
{
  "images": [
    {
      "url": "https://example.com/image1.png",
      "alt": "A beautiful sunset over mountains - Generated image 1"
    }
  ],
  "model": "flux-pro",
  "prompt": "A beautiful sunset over mountains",
  "generated_at": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/image`
Returns information about supported models.

**Response:**
```json
{
  "models": [
    {
      "name": "flux-pro",
      "singleImage": true,
      "description": "High-quality single image generation"
    }
  ],
  "supported_features": {
    "single_image_models": ["flux-pro", "flux-ultra"],
    "multi_image_models": ["flux-standard"]
  }
}
```

## Error Handling

The implementation includes comprehensive error handling:
- Validates required fields (prompt, model)
- Validates model support
- Validates `num_outputs` range (1-4) for multi-image models
- Provides clear error messages for API failures
- Logs warnings when `num_outputs` is provided for single-image models

## Navigation

The image generation feature is accessible via:
- Desktop: Sidebar navigation with "Images" icon
- Mobile: Hamburger menu with "Images" option
- Direct URL: `/image`