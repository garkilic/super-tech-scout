import React, { useState, useEffect } from 'react';

interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  onStepComplete?: (stepId: string) => void;
}

export default function ProgressTracker({ steps, onStepComplete }: ProgressTrackerProps) {
  const [progressStates, setProgressStates] = useState<{ [key: string]: number }>({});
  const [localSteps, setLocalSteps] = useState<ProgressStep[]>(steps);

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  useEffect(() => {
    steps.forEach((step) => {
      if (step.status === 'in_progress' || step.status === 'completed') {
        const startTime = Date.now();
        // Random duration between 2-5 seconds
        const duration = 2000 + Math.random() * 3000;
        let lastUpdateTime = startTime;
        let currentProgress = 0;

        const updateProgress = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const deltaTime = currentTime - lastUpdateTime;
          lastUpdateTime = currentTime;

          // Calculate progress with easing function for more gradual filling
          const targetProgress = Math.min((elapsed / duration) * 100, 100);
          const progressStep = (targetProgress - currentProgress) * 0.1; // Gradual step
          currentProgress = Math.min(currentProgress + progressStep, targetProgress);
          
          setProgressStates(prev => ({
            ...prev,
            [step.id]: currentProgress
          }));

          if (currentProgress < 100) {
            requestAnimationFrame(updateProgress);
          } else if (step.status === 'in_progress' && onStepComplete) {
            // Only call onStepComplete if we're in progress and have the callback
            setTimeout(() => {
              onStepComplete(step.id);
            }, 100); // Small delay to ensure smooth transition
          }
        };

        requestAnimationFrame(updateProgress);
      }
    });
  }, [steps, onStepComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="space-y-4">
        {localSteps.map((step) => (
          <div
            key={step.id}
            className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'in_progress'
                  ? 'bg-blue-500 animate-pulse'
                  : 'bg-gray-700 opacity-50'
              }`}
            >
              {step.status === 'completed' ? (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : step.status === 'in_progress' ? (
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin" />
              ) : (
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <span className={`text-lg font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-white'}`}>{step.name}</span>
              <div className="h-1 bg-gray-700 rounded-full mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    step.status === 'completed'
                      ? 'bg-green-500'
                      : step.status === 'in_progress'
                      ? 'bg-blue-500'
                      : 'bg-gray-600 opacity-50'
                  }`}
                  style={{
                    width: step.status === 'completed' 
                      ? '100%' 
                      : step.status === 'in_progress'
                      ? `${progressStates[step.id] || 0}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 