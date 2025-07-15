import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  data?: unknown;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep?: number;
  className?: string;
}

export function Stepper({ steps, currentStep = 0, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const isPending = step.status === 'pending';

          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0",
                    {
                      "bg-orange-500 border-orange-500 text-white": isActive,
                      "bg-green-500 border-green-500 text-white": isCompleted,
                      "bg-red-500 border-red-500 text-white": isError,
                      "bg-gray-200 border-gray-300 text-gray-500": isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* Vertical line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-8 mt-2 transition-colors duration-200",
                      {
                        "bg-orange-500": isCompleted,
                        "bg-gray-300": !isCompleted,
                      }
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    {
                      "text-orange-600": isActive,
                      "text-green-600": isCompleted,
                      "text-red-600": isError,
                      "text-gray-500": isPending,
                    }
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div
                    className={cn(
                      "text-xs mt-1 transition-colors duration-200",
                      {
                        "text-orange-500": isActive,
                        "text-green-500": isCompleted,
                        "text-red-500": isError,
                        "text-gray-400": isPending,
                      }
                    )}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}