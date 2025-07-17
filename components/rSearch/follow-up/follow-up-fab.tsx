'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

interface FollowUpFabProps {
  onClick: () => void;
  isVisible: boolean;
}

export default function FollowUpFab({ onClick, isVisible }: FollowUpFabProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isVisible) return null;

  return (
    <Button
      onClick={onClick}
      className={`fixed z-40 bg-orange-600 hover:bg-orange-700 text-white shadow-2xl transition-all duration-300 ease-in-out ${
        isMobile 
          ? 'bottom-6 right-6 w-14 h-14' 
          : 'bottom-8 right-8 w-16 h-16'
      } rounded-full flex items-center justify-center group`}
    >
      <MessageCircle className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} transition-transform group-hover:scale-110`} />
    </Button>
  );
}