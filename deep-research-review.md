# Deep Research Feature Review & Setup Guide

## Overview

The Deep Research feature is an advanced AI-powered research assistant that conducts comprehensive, multi-layered research on any topic. It combines intelligent search query generation, web scraping, and advanced reasoning to produce detailed research reports.

## What Was Fixed

### 1. Environment Variable Issues
- **Problem**: Inconsistent environment variable names across files
- **Solution**: Standardized all environment variables to match `.env.example`
- **Fixed**: Changed `OPENAI_KEY` to `OPENAI_API_KEY` in `lib/ai/providers.ts`
- **Added**: Missing environment variables to `next.config.js`

### 2. Enhanced Error Handling
- **Problem**: Cryptic error messages when API keys were missing
- **Solution**: Added comprehensive validation with clear setup instructions
- **Features**:
  - Detects placeholder values in environment variables
  - Provides step-by-step setup instructions
  - Lists specific missing variables

### 3. Enhanced Progress Display
- **Problem**: Limited visibility into research progress and states
- **Solution**: Added comprehensive state tracking and progress visualization
- **Features**:
  - Real-time progress bar with percentage completion
  - Visual state indicators with emojis
  - Step-by-step progress tracking
  - Metadata display including depth, insights count, and sources
  - Detailed timeline view of all research activities

### 4. Improved API Streaming
- **Problem**: Basic streaming without detailed state information
- **Solution**: Enhanced streaming API with rich data updates
- **Features**:
  - State-based progress updates
  - Callback system for learnings and URLs
  - Metadata transmission
  - Error state handling
  - CORS headers for better compatibility

### 5. Enhanced UI Components
- **Problem**: Basic progress display without state awareness
- **Solution**: Upgraded ResearchProgress component
- **Features**:
  - Color-coded progress entries based on activity type
  - Metadata display panel
  - Current state indicator
  - Enhanced timeline visualization

## How It Works

### Research Flow
1. **Initialization** 🚀
   - Validates environment variables
   - Sets up research parameters (breadth, depth)
   - Initializes progress tracking

2. **Query Generation** 🧠
   - Uses AI to generate multiple search queries
   - Based on original query and existing learnings
   - Optimizes for breadth and specificity

3. **Web Search** 🔍
   - Searches using Firecrawl API (primary) or Serper API (fallback)
   - Scrapes content from multiple sources
   - Collects URLs and markdown content

4. **Content Processing** 📊
   - Extracts key learnings from scraped content
   - Generates follow-up questions for deeper research
   - Updates progress in real-time

5. **Recursive Depth** 🔬
   - If depth > 1, generates new queries based on learnings
   - Continues research at deeper levels
   - Tracks depth progression

6. **Report Generation** 📝
   - Synthesizes all learnings into comprehensive report
   - Includes citations and source links
   - Formats as professional markdown document

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the project root with the following variables:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
SERPER_API_KEY=your_serper_api_key_here

# Optional Configuration
OPENAI_MODEL=o3-mini
OPENAI_ENDPOINT=https://api.openai.com/v1/
CONTEXT_SIZE=128000

# Regular rSearch Configuration (if using main search)
NEXT_PUBLIC_AI_PROVIDER_API_KEY=your_ai_provider_api_key_here
NEXT_PUBLIC_AI_PROVIDER_BASE_URL=https://api.openai.com
NEXT_PUBLIC_AI_REFINER_MODEL=gpt-4o-mini
NEXT_PUBLIC_AI_REASONING_MODEL=gpt-4o
NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT="AI-powered search with advanced reasoning capabilities"

# Supabase (for saving results)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Get API Keys

#### OpenAI API Key
- Visit: https://platform.openai.com/api-keys
- Create a new API key
- Ensure you have credits/billing set up

#### Firecrawl API Key
- Visit: https://firecrawl.dev/
- Sign up for an account
- Get your API key from the dashboard

#### Serper API Key (Fallback Search)
- Visit: https://serper.dev/api-key
- Sign up for an account
- Get your API key

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## Usage

### 1. Access Deep Research
Navigate to: `http://localhost:3000/deeprsearch?q=your_research_topic`

### 2. Monitor Progress
The interface provides real-time updates:
- **Progress Bar**: Shows completion percentage
- **State Indicator**: Current research phase with emoji
- **Step Counter**: Current step and total steps
- **Metrics**: Real-time insights and sources count

### 3. View Results
- **Research Progress**: Detailed timeline of all activities
- **Sources**: Interactive grid of all visited websites
- **Final Report**: Comprehensive markdown report with citations

## API Configuration

### Research Parameters
- **Breadth** (default: 3): Number of search queries generated per depth level
- **Depth** (default: 2): How many levels deep to research
- **Concurrency** (default: 2): Number of parallel searches

### Customization
Modify parameters in `app/deeprsearch/page.tsx`:
```typescript
body: JSON.stringify({ 
  query: searchTerm,
  breadth: 3, // Increase for broader research
  depth: 2    // Increase for deeper research
})
```

## Troubleshooting

### Common Issues

1. **"Missing or invalid environment variables" Error**
   - Ensure all API keys are set in `.env.local`
   - Remove placeholder values (anything with `your_` or `_here`)
   - Restart the development server

2. **API Rate Limiting**
   - Reduce concurrency limit in `lib/deep-research.ts`
   - Increase timeout values
   - Use higher-tier API plans

3. **Search Failures**
   - Check Firecrawl API status
   - Verify Serper API key is working
   - Monitor console for detailed error messages

4. **Slow Performance**
   - Reduce breadth and depth parameters
   - Check internet connection
   - Monitor API response times

### Development Mode
For development without API keys, the system will show:
- Clear error messages with setup instructions
- Guidance on where to get API keys
- Step-by-step configuration help

## Technical Architecture

### Key Files
- `app/api/deeprsearch/route.ts` - Streaming API endpoint
- `lib/deep-research.ts` - Core research logic
- `lib/ai/providers.ts` - AI model configuration
- `app/deeprsearch/page.tsx` - Main UI component
- `components/deepRSearch/research-progress.tsx` - Progress display

### Data Flow
1. User query → API endpoint
2. Environment validation
3. Research initialization with callbacks
4. Streaming updates to frontend
5. Real-time UI updates
6. Final report generation
7. Results saved to Supabase (if configured)

## Full State Display

The enhanced system now displays:
- ✅ **All research states** with visual indicators
- ✅ **Real-time progress** with percentages and steps
- ✅ **Detailed timeline** of all activities
- ✅ **Metadata information** including depth and metrics
- ✅ **Error handling** with clear instructions
- ✅ **Source tracking** with interactive display
- ✅ **Responsive design** for all screen sizes

## Future Enhancements

Potential improvements:
- Mock/demo mode for testing without API keys
- Research result caching
- Export functionality (PDF, Word)
- Custom research templates
- Collaborative research features
- Advanced filtering and search within results

---

The Deep Research feature is now fully functional with comprehensive state display, robust error handling, and clear setup instructions. Users can monitor every aspect of the research process in real-time and receive detailed, well-cited research reports.