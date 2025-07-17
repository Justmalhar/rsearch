# Follow-up Questions Feature

## Overview

The follow-up questions feature allows users to engage in a chat-style conversation about their original search results on the rSearch page. This feature appears after the initial article is generated and provides a seamless way to explore related topics and get additional insights.

## Features

### 🎯 Core Functionality
- **Sticky Chat Interface**: A floating chat box appears at the bottom of the screen after the initial search results are generated
- **Context-Aware Responses**: Follow-up questions understand the original search context and combine it with new search results
- **Real-time Streaming**: Responses are streamed in real-time just like the main rSearch feature
- **Chat History**: Users can ask multiple follow-up questions in a conversational manner

### 📱 Mobile Responsive Design
- **Adaptive Layout**: The chat interface adapts to mobile screens, taking full width on smaller devices
- **Touch-Friendly**: All interaction elements are optimized for touch interfaces
- **Collapsible Interface**: Users can expand/collapse the chat to save screen space

### 🔧 Technical Features
- **Query Refinement**: Follow-up questions are refined using AI to improve search accuracy
- **Source Integration**: Combines both original and new search sources in responses
- **Error Handling**: Graceful error handling with user-friendly error messages
- **Loading States**: Clear loading indicators during processing

## User Interface Components

### 1. Floating Action Button (FAB)
- **Location**: Bottom-right corner of the screen
- **Appearance**: Orange circular button with chat icon
- **Visibility**: Only appears after the initial AI response is complete
- **Behavior**: Clicking opens the follow-up chat interface

### 2. Chat Interface
- **Header**: Shows "Follow-up Questions" title with expand/collapse and close buttons
- **Message Area**: Scrollable area showing conversation history
- **Input Area**: Text input with send button for new questions

### 3. Message Display
- **User Messages**: Displayed with user icon and orange theme
- **AI Responses**: Displayed with bot icon and gray theme
- **Expandable Sections**: 
  - Thinking process (reasoning content)
  - Sources (with links and snippets)

## How It Works

### 1. Initial Trigger
The follow-up feature becomes available when:
- The user has performed a search on the rSearch page
- The initial AI response has been completed (`isAiComplete = true`)
- The chat interface is not already open

### 2. Question Processing Flow
1. **User Input**: User types a follow-up question
2. **Query Refinement**: The question is refined using the original search context
3. **New Search**: Fresh search results are fetched based on the refined query
4. **AI Response**: A new AI response is generated combining:
   - Original search term and results
   - Previous AI response (for context)
   - New search results
   - Follow-up question

### 3. Response Integration
The AI response considers:
- **Original Context**: The initial search term and findings
- **Question Context**: The specific follow-up question
- **Combined Sources**: Both original and new search results
- **Conversational Flow**: Maintains continuity with previous responses

## API Endpoints

### `/api/rsearch/follow-up`
Handles follow-up question processing with streaming responses.

**Request Body:**
```json
{
  "followUpQuestion": "string",
  "originalSearchTerm": "string",
  "originalSources": "SearchResult[]",
  "originalAiResponse": "string",
  "originalReasoningContent": "string",
  "newSources": "SearchResult[]",
  "knowledgeGraph": "object",
  "refinedQuery": "object",
  "originalRefinedQuery": "object"
}
```

**Response:** Streaming JSON with content chunks

### Updated `/api/query`
Enhanced to handle follow-up context.

**Additional Parameters:**
- `contextTerm`: Original search term for context

## File Structure

```
components/rSearch/follow-up/
├── follow-up-chat.tsx          # Main chat interface component
├── follow-up-message.tsx       # Individual message display
├── follow-up-results.tsx       # AI response and sources display
└── follow-up-fab.tsx          # Floating action button

app/api/rsearch/follow-up/
└── route.ts                    # Follow-up API endpoint

components/ui/
└── scroll-area.tsx             # New UI component for scrollable areas
```

## Styling & Theme

The follow-up feature maintains consistency with the existing rSearch design:

- **Primary Color**: Orange (#ea580c, #f97316)
- **Gray Accents**: For AI responses and neutral elements
- **Border Radius**: Consistent with existing components
- **Typography**: Matches existing text styles
- **Responsive Breakpoints**: Uses the same mobile breakpoint (768px)

## Mobile Optimizations

- **Full Width**: Chat takes full screen width on mobile
- **Touch Targets**: Minimum 44px touch targets for buttons
- **Keyboard Handling**: Proper keyboard navigation support
- **Viewport Considerations**: Maximum height constraints to avoid viewport issues

## Error Handling

- **Network Errors**: Displays user-friendly error messages
- **API Failures**: Graceful degradation with retry options
- **Timeout Handling**: Proper handling of long-running requests
- **Validation**: Input validation and sanitization

## Performance Considerations

- **Lazy Loading**: Components are loaded only when needed
- **Streaming Responses**: Real-time response streaming for better UX
- **Memory Management**: Proper cleanup of resources
- **Debouncing**: Input debouncing to prevent excessive API calls

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus management for modal interactions
- **Color Contrast**: Meets WCAG contrast requirements

## Future Enhancements

Potential improvements for future iterations:
- **Voice Input**: Speech-to-text for questions
- **Question Suggestions**: AI-generated suggested follow-up questions
- **Export Chat**: Export conversation history
- **Search Within Chat**: Search through conversation history
- **Bookmarking**: Save important exchanges