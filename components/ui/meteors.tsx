"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface MeteorsProps extends React.HTMLAttributes<HTMLSpanElement> {
  number?: number;
}

export const Meteors = ({ number = 20, ...props }: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => ({
      top: Math.floor(Math.random() * 50) + "vh",
      left: Math.floor(Math.random() * 100) + "vw",
      animationDelay: `${Math.random() * 1 + 0.2}s`,
      animationDuration: `${Math.floor(Math.random() * 8 + 2)}s`,
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {meteorStyles.map((style, idx) => (
        <span
          key={`meteor-${idx}`}
          className={cn(
            "absolute size-0.5 rotate-[215deg] animate-meteor rounded-full bg-blue-400/80 shadow-[0_0_0_1px_#3b82f640]"
          )}
          style={style}
          {...props}
        >
          {/* Meteor Tail */}
          <div className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-blue-300 to-transparent" />
        </span>
      ))}
    </div>
  );
};
