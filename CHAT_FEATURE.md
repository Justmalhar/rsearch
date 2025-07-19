# rSearch Chat Feature

## Overview

The rSearch Chat feature allows users to have conversational interactions with an AI assistant powered by OpenAI's GPT-4 model. The chat interface provides a modern, responsive design with real-time message exchange and markdown rendering for rich responses.

## Features

### User Interface
- **Modern Chat Design**: Clean, responsive interface with chat bubbles for user messages
- **Full-Width Assistant Responses**: Assistant messages use the full screen width with proper padding
- **Markdown Rendering**: Assistant responses are rendered with rich markdown formatting
- **Loading States**: Animated loading indicators while waiting for responses
- **Auto-scroll**: Messages automatically scroll to the bottom for better UX
- **Rounded Buttons**: Modern rounded full buttons for the send functionality

### Styling
- **Consistent with rSearch**: Uses the same orange color scheme and styling as the main rSearch results
- **Chat Bubbles**: User messages appear as orange chat bubbles on the right
- **Full-Width Cards**: Assistant messages appear as full-width cards with markdown styling
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### API Integration
- **OpenAI GPT-4**: Powered by OpenAI's GPT-4 model for high-quality responses
- **Improved System Prompt**: Enhanced system message based on rSearch's prompt engineering
- **Error Handling**: Graceful error handling for API failures and missing configuration

## Setup Instructions

### 1. Environment Variables
Add your OpenAI API key to your environment variables:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Navigation
The chat feature is accessible via:
- **Desktop**: Sidebar navigation with a chat icon
- **Mobile**: Mobile menu with the same chat link
- **Direct URL**: Navigate to `/chat`

### 3. Usage
1. Navigate to the chat page
2. Type your message in the input field
3. Press Enter or click the send button
4. Wait for the AI assistant to respond
5. Continue the conversation as needed

## Technical Implementation

### Files Created/Modified

#### New Files
- `app/api/chat/route.ts` - API endpoint for chat functionality
- `app/chat/page.tsx` - Chat page component
- `CHAT_FEATURE.md` - This documentation file

#### Modified Files
- `components/ui/sidebar.tsx` - Added chat navigation link

### API Route (`/api/chat`)
- **Method**: POST
- **Input**: JSON with `messages` array
- **Output**: JSON with `response` object
- **Error Handling**: Returns appropriate error messages for missing API keys or invalid requests

### Chat Page Component
- **State Management**: Uses React hooks for message state and loading states
- **Markdown Rendering**: Uses react-markdown with custom styling components
- **Auto-scroll**: Implements smooth scrolling to the latest message
- **Responsive Design**: Adapts to different screen sizes

### Styling Components
The chat page uses the same markdown styling components as the rSearch results:
- Headings (h1-h6) with orange color scheme
- Tables with proper styling and hover effects
- Lists with orange markers
- Links with orange hover effects
- Code blocks with orange background
- Blockquotes with orange border

## System Prompt

The chat feature uses an improved system prompt based on rSearch's prompt engineering:

- **Informative and relevant**: Addresses user queries comprehensively
- **Well-structured**: Uses clear headings and professional tone
- **Engaging and detailed**: Provides conversational yet informative responses
- **Markdown Formatted**: Uses proper markdown formatting for better readability
- **Explanatory and Comprehensive**: Offers detailed analysis and insights

## Error Handling

The implementation includes comprehensive error handling:
- Missing OpenAI API key
- Invalid message format
- Network errors
- API rate limiting
- General error states

## Future Enhancements

Potential improvements for the chat feature:
- Message persistence (database storage)
- User authentication
- Chat history
- File uploads
- Voice input/output
- Custom chat models
- Conversation export
- Chat templates

## Dependencies

The chat feature uses the following dependencies (already included in the project):
- `openai` - For OpenAI API integration
- `react-markdown` - For markdown rendering
- `lucide-react` - For icons
- `@/components/ui/button` - For UI components