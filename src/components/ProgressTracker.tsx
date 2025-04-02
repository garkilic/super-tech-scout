import React, { useState, useEffect } from 'react';

interface SubStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress?: number;
}

interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  subSteps: SubStep[];
  progress?: number;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  onStepComplete?: (stepId: string) => void;
}

const STATUS_MESSAGES = {
  gpt4: [
    "Analyzing technology landscape...",
    "Evaluating market impact...",
    "Generating insights...",
    "Processing data...",
    "Consolidating information...",
    "Refining analysis..."
  ],
  gemini: [
    "Assessing current state...",
    "Identifying patterns...",
    "Processing information...",
    "Generating overview...",
    "Analyzing trends..."
  ],
  claude: [
    "Performing deep analysis...",
    "Processing technical details...",
    "Evaluating requirements...",
    "Identifying challenges...",
    "Synthesizing findings..."
  ],
  synthesis: [
    "Combining insights...",
    "Organizing information...",
    "Structuring report...",
    "Finalizing analysis...",
    "Preparing output..."
  ]
};

export default function ProgressTracker({ steps, onStepComplete }: ProgressTrackerProps) {
  const [progressStates, setProgressStates] = useState<{ [key: string]: number }>({});
  const [localSteps, setLocalSteps] = useState<ProgressStep[]>(steps);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [statusMessages, setStatusMessages] = useState<{ [key: string]: string }>({});
  const [messageIndices, setMessageIndices] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    setLocalSteps(steps);
  }, [steps]);

  useEffect(() => {
    // Update status messages for in-progress steps
    const updateMessages = () => {
      const newMessages: { [key: string]: string } = {};
      const newIndices: { [key: string]: number } = {};

      steps.forEach(step => {
        if (step.status === 'in_progress') {
          const messages = STATUS_MESSAGES[step.id as keyof typeof STATUS_MESSAGES];
          const currentIndex = messageIndices[step.id] || 0;
          newMessages[step.id] = messages[currentIndex];
          newIndices[step.id] = (currentIndex + 1) % messages.length;
        }
      });

      setStatusMessages(newMessages);
      setMessageIndices(newIndices);
    };

    const interval = setInterval(updateMessages, 2000);
    return () => clearInterval(interval);
  }, [steps, messageIndices]);

  useEffect(() => {
    steps.forEach((step) => {
      if (step.status === 'in_progress' || step.status === 'completed') {
        const startTime = Date.now();
        const duration = step.id === 'synthesis' ? 2000 : 2000 + Math.random() * 3000;
        let lastUpdateTime = startTime;
        let currentProgress = 0;

        const updateProgress = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const deltaTime = currentTime - lastUpdateTime;
          lastUpdateTime = currentTime;

          const targetProgress = Math.min((elapsed / duration) * 100, 100);
          const progressStep = (targetProgress - currentProgress) * 0.1;
          currentProgress = Math.min(currentProgress + progressStep, targetProgress);
          
          setProgressStates(prev => ({
            ...prev,
            [step.id]: currentProgress
          }));

          if (currentProgress < 100) {
            requestAnimationFrame(updateProgress);
          } else if (step.status === 'in_progress' && onStepComplete) {
            setTimeout(() => {
              onStepComplete(step.id);
            }, 100);
          }
        };

        requestAnimationFrame(updateProgress);
      }
    });
  }, [steps, onStepComplete]);

  const calculateStepProgress = (step: ProgressStep) => {
    if (step.status === 'completed') return 100;
    if (step.status === 'pending') return 0;
    
    const completedSubSteps = step.subSteps.filter(sub => sub.status === 'completed').length;
    const totalSubSteps = step.subSteps.length;
    return (completedSubSteps / totalSubSteps) * 100;
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="space-y-6">
        {localSteps.map((step) => (
          <div
            key={step.id}
            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden"
          >
            <div 
              className="flex items-center space-x-4 p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors duration-200"
              onClick={() => toggleStep(step.id)}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-white'}`}>
                      {step.name}
                    </span>
                    {step.status === 'in_progress' && (
                      <span className="text-sm text-blue-400 animate-fade-in-out">
                        {statusMessages[step.id]}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                      expandedSteps.has(step.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {(expandedSteps.has(step.id) || step.status === 'in_progress') && (
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
                        width: `${calculateStepProgress(step)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className={`p-4 space-y-3 transition-all duration-300 ${
              expandedSteps.has(step.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              {step.subSteps.map((subStep) => (
                <div
                  key={subStep.id}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    subStep.status === 'in_progress' ? 'bg-gray-700/50' : ''
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      subStep.status === 'completed'
                        ? 'bg-green-500'
                        : subStep.status === 'in_progress'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-700 opacity-50'
                    }`}
                  >
                    {subStep.status === 'completed' ? (
                      <svg
                        className="w-3 h-3 text-white"
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
                    ) : subStep.status === 'in_progress' ? (
                      <div className="w-2 h-2 border-2 border-white rounded-full animate-spin" />
                    ) : (
                      <div className="w-2 h-2 border-2 border-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${subStep.status === 'pending' ? 'text-gray-400' : 'text-white'}`}>
                      {subStep.name}
                    </span>
                    {(subStep.status === 'in_progress' || subStep.status === 'completed') && (
                      <div className="h-0.5 bg-gray-700 rounded-full mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            subStep.status === 'completed'
                              ? 'bg-green-500'
                              : subStep.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-600 opacity-50'
                          }`}
                          style={{
                            width: subStep.status === 'completed' 
                              ? '100%' 
                              : subStep.status === 'in_progress'
                              ? `${subStep.progress || 0}%`
                              : '0%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 