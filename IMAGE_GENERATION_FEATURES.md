# Image Generation Features

## Overview
The image generation page now includes advanced features for creating high-quality AI-generated images with enhanced prompts and multiple model options.

## Features

### 1. Model Selection
Users can choose from three different Flux models:
- **Fast**: `black-forest-labs/flux-dev` - Quick generation with good quality
- **Pro**: `black-forest-labs/flux-1.1-pro` - Balanced speed and quality  
- **Ultra**: `black-forest-labs/flux-1.1-pro-ultra` - Highest quality generation

### 2. Prompt Enhancement
- Automatically enhances user prompts using Google Gemini 2.5 Flash via OpenRouter
- Adds relevant descriptors like camera angles, lighting, environment, color palette, style, mood, and composition
- Expands nouns with descriptive adjectives
- Replaces vague terms with specific ones
- Optimizes prompts for photorealistic or stylized AI image generation

### 3. Enhanced User Interface
- **Copy Button**: Users can copy the enhanced prompt to clipboard with a single click
- **Click to Download**: Entire images are clickable for easy download
- **Visual Feedback**: Shows both original and enhanced prompts
- **Responsive Design**: Works seamlessly on desktop and mobile

## Environment Variables

### Required
```bash
# Replicate API for image generation
REPLICATE_API_TOKEN=your_replicate_api_token_here

# OpenRouter API for prompt enhancement (optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site URL for OpenRouter (optional)
NEXT_PUBLIC_SITE_URL=https://your-site.com
```

### Setup Instructions

1. **Replicate API Token** (Required):
   - Sign up at [replicate.com](https://replicate.com)
   - Get your API token from the dashboard
   - Add to `.env.local`: `REPLICATE_API_TOKEN=your_token`

2. **OpenRouter API Key** (Optional):
   - Sign up at [openrouter.ai](https://openrouter.ai)
   - Get your API key from the dashboard
   - Add to `.env.local`: `OPENROUTER_API_KEY=your_key`
   - If not provided, the system will use the original prompt without enhancement

3. **Site URL** (Optional):
   - Add your site URL for OpenRouter rankings
   - Add to `.env.local`: `NEXT_PUBLIC_SITE_URL=https://your-site.com`

## Usage

1. **Enter a prompt**: Describe the image you want to generate
2. **Select aspect ratio**: Choose from Square (1:1), Landscape (16:9), or Portrait (9:16)
3. **Choose model**: Select Fast, Pro, or Ultra based on your needs
4. **Generate**: Click "Generate Images" to create your artwork
5. **Copy enhanced prompt**: Use the copy button to save the enhanced prompt
6. **Download images**: Click on any generated image to download it

## Technical Details

### Prompt Enhancement Process
1. User submits original prompt
2. System sends prompt to Google Gemini 2.5 Flash via OpenRouter
3. AI enhances prompt with visual descriptors and technical details
4. Enhanced prompt is sent to Replicate for image generation
5. Both original and enhanced prompts are displayed to user

### Error Handling
- If OpenRouter API is unavailable, system falls back to original prompt
- Graceful degradation ensures image generation continues even if enhancement fails
- User-friendly error messages for all failure scenarios

### Performance
- Prompt enhancement typically takes 1-3 seconds
- Image generation time varies by model (Fast: ~30s, Pro: ~60s, Ultra: ~90s)
- Responsive UI with loading states and progress indicators