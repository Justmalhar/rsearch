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
      const zapierWebhookUrl = process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL;
      
      if (!zapierWebhookUrl) {
        console.error("Zapier webhook URL not configured");
        toast({
          title: "Configuration error",
          description: "Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(zapierWebhookUrl, {
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

      if (response.ok) {
        // Mark user as pro subscriber in localStorage
        localStorage.setItem("rSearch_pro_subscriber", "true");
        
        toast({
          title: "Welcome to rSearch Pro! 🎉",
          description: "You now have 3 months of unlimited access to all features.",
        });
        
        onClose();
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Mark as dismissed to prevent showing again
    localStorage.setItem("rSearch_pro_modal_dismissed", "true");
    onClose();
  };

  const features = [
    "Unlimited search queries",
    "Unlimited image generation",
    "Unlimited deep research queries",
    "Priority support",
    "Advanced AI models",
    "No rate limits"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] mx-4">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Get rSearch Pro Free for 3 Months!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Unlock unlimited access to all premium features. No credit card required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
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