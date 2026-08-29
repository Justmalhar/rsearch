# rSearch: AI-Powered Reasoning Engine

![rSearch](https://rsearch.app/og.png)


A cutting-edge research assistant powered by artificial intelligence that harnesses the advanced reasoning capabilities of [DeepSeek R1](https://huggingface.co/deepseek-ai/DeepSeek-R1) combined with comprehensive internet search functionality. **rSearch** delivers precise, well-reasoned responses to complex research queries by:

- Leveraging state-of-the-art language models for refining queries
- Performing intelligent web searches across multiple data sources
- Synthesizing information through sophisticated chain-of-thought reasoning processes
- Providing clear, actionable insights backed by reliable sources
- Customizable AI models from [OpenAI](https://openai.com), [OpenRouter](https://openrouter.ai) or [DeepSeek](https://deepseek.com)
- Self hosted alternative to [Perplexity](https://perplexity.ai)

## Demo

![Demo](https://github.com/Justmalhar/rsearch/raw/main/demo.png)

Try rSearch* for free here - [rsearch.app](https://rsearch.app)

## Overview

**rSearch** leverages [DeepSeek's Reasoner - R1 model](https://huggingface.co/deepseek-ai/DeepSeek-R1) to perform Chain-of-Thought reasoning on search results. The platform first refines your query, searches the internet using [Serper.dev](https://serper.dev) API, and then applies advanced reasoning to synthesize a comprehensive, well-thought-out response. Built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/), it offers a seamless research experience while maintaining high performance and code quality.

### AI Models and Reasoning

- **DeepSeek-R1**: State-of-the-art reasoning model that powers rSearch's analytical capabilities
  - Trained via large-scale reinforcement learning
  - Exceptional performance in math, code, and reasoning tasks
  - Comparable performance to [OpenAI-o1](https://openai.com)
  - Open-source availability for research and development

- **Customizable AI Models**: Added support to use any AI models from [OpenAI](https://openai.com), [OpenRouter](https://openrouter.ai) or [DeepSeek](https://deepseek.com) as your AI provider.

- **Chain-of-Thought Process**:
  1. Query Refinement: Intelligent processing of user input
  2. Internet Search: Comprehensive data gathering via [Serper.dev](https://serper.dev) API
  3. Reasoning Analysis: Deep analysis using DeepSeek's reasoning capabilities
  4. Response Synthesis: Well-structured, logical conclusions

## Key Features

- **Multiple Search Modes**: Search across diverse content categories:
  - **Web Search**: Broad and efficient web search capability
  - **Images**: Visual content search
  - **Videos**: Video content discovery
  - **News**: Latest headlines and articles
  - **Places**: Local information and geographical insights
  - **Shopping**: Product information and price comparisons
  - **Scholar**: Academic content and research papers
  - **Patents**: Patent database search

- **Modern UI Components**:
  - Responsive sidebar navigation
  - Mobile-optimized header
  - Dynamic search results display
  - Interactive loading states
  - Customizable themes

## Deploy

Deploying **rSearch** is simple and fast with Vercel's one-click deployment option. Vercel provides a powerful and scalable environment for your project.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/justmalhar/rsearch&env=SERPER_API_KEY&env=AI_PROVIDER_API_KEY&env=AI_PROVIDER_BASE_URL&env=AI_REFINER_MODEL&env=AI_REASONING_MODEL&env=NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT)


## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: ShadCN UI components
- **State Management**: React Hooks
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/justmalhar/rsearch.git
    cd rsearch
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
    ```bash
    cp .env.example .env.local
    ```
   
    Create a `.env.local` file in the root directory with the following variables:

   ```bash
    # Serper API Key (Google Search API) - https://serper.dev/api-key
    SERPER_API_KEY=

    # AI provider key — server-side only. Never use NEXT_PUBLIC_ for API keys.
    # OpenAI: https://platform.openai.com/api-keys
    # OpenRouter: https://openrouter.ai/settings/keys
    # DeepSeek: https://platform.deepseek.com/api_keys
    AI_PROVIDER_API_KEY=
    # Alternative (already used by /api/chat): OPENROUTER_API_KEY=

    # AI Provider Base URL (server-side)
    # DeepSeek: https://api.deepseek.com
    # OpenAI: https://api.openai.com/v1
    # OpenRouter: https://openrouter.ai/api/v1
    AI_PROVIDER_BASE_URL=https://api.deepseek.com

    # AI Query Refiner Model
    # DeepSeek: deepseek-chat | OpenAI: gpt-4o-mini | OpenRouter: openai/gpt-4o-mini
    AI_REFINER_MODEL=gpt-4o-mini

    # AI Reasoning Model
    # DeepSeek: deepseek-reasoner | OpenAI: gpt-4o | OpenRouter: openai/gpt-4o
    AI_REASONING_MODEL=gpt-4o

    # Landing Page Copy Text
    NEXT_PUBLIC_LANDING_PAGE_COPY_TEXT="AI-powered search with advanced reasoning capabilities"
    ```

5. Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```

The application will be available at `http://localhost:3000`

## Development Commands

- `npm run dev`: Start development server
- `npm run build`: Create production build
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality checks

## Project Structure

```
rsearch/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── rSearch/          # Search page
├── components/          # React components
│   ├── rSearch/        # Search-specific components
│   └── ui/             # Reusable ShadCN UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [DeepSeek-R1](https://huggingface.co/deepseek-ai/DeepSeek-R1)
- Search capabilities by [Serper.dev](https://serper.dev)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons from various sources including custom SVGs


## Stay Connected
- **Twitter/X**: [@justmalhar](https://twitter.com/justmalhar) 🛠
- **LinkedIn**: [Malhar Ujawane](https://linkedin.com/in/justmalhar) 💻
- **GitHub**: [justmalhar](https://github.com/justmalhar) 💻
