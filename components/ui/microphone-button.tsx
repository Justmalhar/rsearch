import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface MicrophoneButtonProps {
  onTranscriptReceived: (transcript: string) => void;
  className?: string;
}

export function MicrophoneButton({ onTranscriptReceived, className = '' }: MicrophoneButtonProps) {
  const { isRecording, isTranscribing, startRecording, stopRecording, transcript, error } = useAudioRecorder();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (transcript) {
      onTranscriptReceived(transcript);
    }
  }, [transcript, onTranscriptReceived]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        onClick={handleClick}
        disabled={isTranscribing}
        className={`h-8 w-8 rounded-full transition-all duration-200 ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-700'
        } ${className}`}
      >
        {isTranscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {/* Error tooltip */}
      {showError && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {error}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
    </div>
  );
}