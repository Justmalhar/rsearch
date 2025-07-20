# Microphone Feature Documentation

## Overview
The microphone feature allows users to record audio and automatically transcribe it to text using the Deepgram API. The transcribed text is then inserted into the search input field.

## Features
- **Voice Recording**: Click the microphone icon to start recording audio
- **Visual Feedback**: The microphone button changes color and shows recording state
- **Automatic Transcription**: Recorded audio is sent to Deepgram API for transcription
- **Text Insertion**: Transcribed text is automatically added to the search input
- **Error Handling**: Displays error messages if recording or transcription fails

## Setup

### 1. Environment Variables
Add your Deepgram API key to your `.env.local` file:

```bash
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 2. Get a Deepgram API Key
1. Sign up at [Deepgram](https://deepgram.com/)
2. Create a new project
3. Copy your API key from the project settings

## Usage

### For Users
1. **Start Recording**: Click the microphone icon in the bottom-right corner of the search input
2. **Speak**: The button will turn red and show a recording indicator
3. **Stop Recording**: Click the microphone icon again to stop recording
4. **Wait for Transcription**: The button will show a loading spinner during transcription
5. **Text Appears**: The transcribed text will be automatically added to the search input

### For Developers

#### Components
- `MicrophoneButton`: The main microphone button component
- `useAudioRecorder`: Custom hook for audio recording functionality

#### API Endpoint
- `POST /api/transcribe`: Handles audio transcription using Deepgram API

#### Files Modified
- `app/page.tsx`: Added microphone button to search input
- `app/api/transcribe/route.ts`: New API endpoint for transcription
- `hooks/useAudioRecorder.ts`: Custom hook for audio recording
- `components/ui/microphone-button.tsx`: Microphone button component
- `.env.example`: Added Deepgram API key configuration

## Technical Details

### Audio Format
- Records audio in WebM format with Opus codec
- Compatible with Deepgram API
- Automatically handles browser compatibility

### API Integration
- Uses Deepgram's Nova-3 model for high-quality transcription
- Supports smart formatting for better text output
- Handles various audio formats and quality levels

### Browser Support
- Requires HTTPS for microphone access
- Works in all modern browsers with MediaRecorder API support
- Gracefully handles permission denials

## Error Handling
- **Microphone Permission**: Shows error if user denies microphone access
- **Network Issues**: Handles API connection failures
- **Transcription Errors**: Displays specific error messages from Deepgram
- **Browser Compatibility**: Graceful fallback for unsupported browsers

## Styling
The microphone button follows the existing design system:
- Orange color scheme matching the app theme
- Smooth animations and transitions
- Responsive design for mobile and desktop
- Visual feedback for all states (idle, recording, transcribing, error)

## Security
- Audio is processed server-side via Deepgram API
- No audio data is stored permanently
- API key is kept secure in environment variables
- HTTPS required for microphone access