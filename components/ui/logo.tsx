"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  const [isProSubscriber, setIsProSubscriber] = useState(false);

  useEffect(() => {
    const checkProStatus = () => {
      const proSubscriber = localStorage.getItem("rSearch_pro_subscriber");
      setIsProSubscriber(proSubscriber === "true");
    };

    // Check initial status
    checkProStatus();

    // Listen for storage changes (when user becomes pro subscriber)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rSearch_pro_subscriber") {
        checkProStatus();
      }
    };

    // Listen for custom event when user subscribes
    const handleProSubscription = () => {
      checkProStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("proSubscription", handleProSubscription);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("proSubscription", handleProSubscription);
    };
  }, []);

  return (
    <div className={`flex flex-col items-center w-full text-center ${className}`}>
      <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity mb-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-blue-600 tracking-tight">
          rSearch
        </h1>
      </Link>
      {isProSubscriber && (
        <div className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          <span>Pro</span>
        </div>
      )}
    </div>
  );
} 