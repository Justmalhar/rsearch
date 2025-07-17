# Follow-up Questions Feature

## Overview

The follow-up questions feature allows users to ask additional questions about their original search results directly within the rSearch page UI. This feature appears after the initial article is generated and integrates seamlessly with the existing rSearch interface, creating additional sections that follow the same UI patterns as the main search results.

## Features

### 🎯 Core Functionality
- **Integrated UI**: Follow-up questions appear as additional sections within the main rSearch interface
- **Context-Aware Responses**: Follow-up questions understand the original search context and combine it with new search results
- **Real-time Streaming**: Responses are streamed in real-time just like the main rSearch feature
- **Consistent Structure**: Each follow-up question creates its own set of expandable sections (Refined Query, Sources, Thinking, Results)

### 📱 Mobile Responsive Design
- **Responsive Layout**: The follow-up interface adapts to all screen sizes following rSearch responsive patterns
- **Touch-Friendly**: All interaction elements are optimized for touch interfaces
- **Expandable Sections**: Users can expand/collapse each section (Refined Query, Sources, Thinking, Results) independently

### 🔧 Technical Features
- **Query Refinement**: Follow-up questions are refined using AI to improve search accuracy
- **Source Integration**: Combines both original and new search sources in responses
- **Error Handling**: Graceful error handling with user-friendly error messages
- **Loading States**: Clear loading indicators during processing

## User Interface Components

### 1. Sticky Bottom Interface
- **Location**: Fixed to the bottom of the screen, appearing after AI response is complete
- **Initial State**: Shows a banner with "Ask a follow-up question" and "Ask Question" button
- **Responsive Design**: Respects the left padding on desktop (same as main content) and full-width on mobile

### 2. Question Input Interface
- **Activation**: Clicking "Ask Question" reveals the input form in the same sticky bottom area
- **Input Field**: Text input with placeholder referencing the original search term and auto-focus
- **Action Buttons**: Send button and Cancel (X) button
- **Form Behavior**: Hides automatically after question submission, shows during processing

### 3. Follow-up Question Results
Each follow-up question creates a complete rSearch-style section in the main content area with:
- **Question Header**: Shows "Follow-up #X" with the question text
- **Refined Query Section**: Expandable section showing AI-refined query and explanation
- **Sources Section**: Expandable section with search results and knowledge graph
- **Thinking Section**: Expandable section with AI reasoning process
- **Results Section**: Expandable section with the final AI response
- **Layout**: Follows the same responsive layout as main rSearch (with proper padding and max-width)

## How It Works

### 1. Initial Trigger
The follow-up feature becomes available when:
- The user has performed a search on the rSearch page
- The initial AI response has been completed (`isAiComplete = true`)
- The follow-up section appears automatically below the main results

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
components/rSearch/
└── follow-up-section.tsx       # Main integrated follow-up section component

app/api/rsearch/follow-up/
└── route.ts                    # Follow-up API endpoint

components/ui/
└── scroll-area.tsx             # UI component for scrollable areas (if needed)
```

## Styling & Theme

The follow-up feature maintains consistency with the existing rSearch design:

- **Primary Color**: Orange (#ea580c, #f97316)
- **Gray Accents**: For AI responses and neutral elements
- **Border Radius**: Consistent with existing components
- **Typography**: Matches existing text styles
- **Responsive Breakpoints**: Uses the same mobile breakpoint (768px)

## Mobile Optimizations

- **Responsive Design**: Follow-up sections adapt to all screen sizes using the same responsive patterns as main rSearch
- **Touch Targets**: Minimum 44px touch targets for buttons and interactive elements
- **Keyboard Handling**: Proper keyboard navigation support for input fields
- **Section Expansion**: Optimized expand/collapse behavior for mobile viewing

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