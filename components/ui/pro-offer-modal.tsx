"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProOfferModal({ isOpen, onClose }: ProOfferModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/pro-subscription', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source: "rSearch Pro Offer Modal",
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Mark user as pro subscriber in localStorage
        localStorage.setItem("rSearch_pro_subscriber", "true");
        
        // Save user data for future use
        localStorage.setItem("rSearch_user_name", name.trim());
        localStorage.setItem("rSearch_user_email", email.trim());
        
        // Dispatch custom event to update Pro badge
        window.dispatchEvent(new CustomEvent("proSubscription"));
        
        toast({
          title: "Welcome to rSearch Pro! 🎉",
          description: "You now have 3 months of unlimited access to all features.",
        });
        
        onClose();
      } else {
        // Handle specific error types
        let errorMessage = "Something went wrong. Please try again.";
        
        if (response.status === 400) {
          errorMessage = data.error || "Please check your information and try again.";
        } else if (response.status === 502) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later or contact support.";
        }
        
        toast({
          title: "Submission failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't mark as permanently dismissed - just close the modal
    onClose();
  };

  const features = [
    "Unlimited search queries",
    "Unlimited image generation",
    "Unlimited deep research queries",
    "Advanced AI models"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm max-w-[85vw] rounded-xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Get rSearch Pro Free for 3 Months!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Unlock unlimited access to all premium features. No credit card required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Features List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">What you&apos;ll get:</h3>
            <div className="grid gap-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-2 pt-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Activating Pro...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Activate Free Pro Access</span>
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Maybe later
              </Button>
            </div>
          </form>

          <div className="text-xs text-gray-500 text-center">
            By activating Pro, you agree to receive updates about rSearch. 
            You can cancel anytime.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}