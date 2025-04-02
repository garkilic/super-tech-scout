'use client';

import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import SearchForm from '../components/SearchForm';
import ProgressTracker from '../components/ProgressTracker';
import ReportDisplay from '../components/ReportDisplay';
import { analyzeTechnology as analyzeWithGPT4 } from '../services/chatgpt';
import { analyzeTechnology as analyzeWithGemini } from '../services/gemini';
import { analyzeTechnology as analyzeWithClaude } from '../services/claude';
import { synthesizeReport } from '../services/synthesis';

type StepStatus = 'pending' | 'in_progress' | 'completed';

interface SubStep {
  id: string;
  name: string;
  status: StepStatus;
  progress?: number;
}

interface Step {
  id: string;
  name: string;
  status: StepStatus;
  subSteps: SubStep[];
}

export default function Home() {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'gpt4',
      name: 'GPT-4 Analysis',
      status: 'pending',
      subSteps: [
        { id: 'gpt4-overview', name: 'Generating Executive Summary', status: 'pending' },
        { id: 'gpt4-technical', name: 'Analyzing Technical Architecture', status: 'pending' },
        { id: 'gpt4-market', name: 'Evaluating Market Impact', status: 'pending' },
        { id: 'gpt4-future', name: 'Projecting Future Developments', status: 'pending' },
      ]
    },
    {
      id: 'gemini',
      name: 'Gemini Analysis',
      status: 'pending',
      subSteps: [
        { id: 'gemini-overview', name: 'Creating Technology Overview', status: 'pending' },
        { id: 'gemini-current', name: 'Assessing Current State', status: 'pending' },
        { id: 'gemini-future', name: 'Identifying Growth Opportunities', status: 'pending' },
      ]
    },
    {
      id: 'claude',
      name: 'Claude Analysis',
      status: 'pending',
      subSteps: [
        { id: 'claude-technical', name: 'Performing Deep Technical Analysis', status: 'pending' },
        { id: 'claude-implementation', name: 'Evaluating Implementation Requirements', status: 'pending' },
        { id: 'claude-challenges', name: 'Identifying Technical Challenges', status: 'pending' },
        { id: 'claude-future', name: 'Analyzing Technical Evolution', status: 'pending' },
      ]
    },
    {
      id: 'synthesis',
      name: 'Report Synthesis',
      status: 'pending',
      subSteps: [
        { id: 'synthesis-integrate', name: 'Combining AI Insights', status: 'pending' },
        { id: 'synthesis-structure', name: 'Organizing Report Structure', status: 'pending' },
        { id: 'synthesis-finalize', name: 'Finalizing Research Report', status: 'pending' },
      ]
    },
  ]);

  const isResearchInProgress = isLoading || (report && steps[3].status !== 'completed');

  const updateSubStepStatus = (stepId: string, subStepId: string, status: StepStatus, progress?: number) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        return {
          ...step,
          subSteps: step.subSteps.map(subStep => 
            subStep.id === subStepId ? { ...subStep, status, progress } : subStep
          )
        };
      }
      return step;
    }));
  };

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setReport(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending', subSteps: step.subSteps.map(sub => ({ ...sub, status: 'pending', progress: 0 })) })));

    try {
      // Start GPT-4 analysis
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'in_progress' } : step
      ));

      // GPT-4 sub-steps with progress simulation
      for (const subStep of steps[0].subSteps) {
        updateSubStepStatus('gpt4', subStep.id, 'in_progress', 0);
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateSubStepStatus('gpt4', subStep.id, 'in_progress', progress);
        }
        updateSubStepStatus('gpt4', subStep.id, 'completed', 100);
      }

      const gpt4Analysis = await analyzeWithGPT4(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));

      // Start Gemini analysis
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'in_progress' } : step
      ));

      // Gemini sub-steps with progress simulation
      for (const subStep of steps[1].subSteps) {
        updateSubStepStatus('gemini', subStep.id, 'in_progress', 0);
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateSubStepStatus('gemini', subStep.id, 'in_progress', progress);
        }
        updateSubStepStatus('gemini', subStep.id, 'completed', 100);
      }

      const geminiAnalysis = await analyzeWithGemini(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));

      // Start Claude analysis
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'in_progress' } : step
      ));

      // Claude sub-steps with progress simulation
      for (const subStep of steps[2].subSteps) {
        updateSubStepStatus('claude', subStep.id, 'in_progress', 0);
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateSubStepStatus('claude', subStep.id, 'in_progress', progress);
        }
        updateSubStepStatus('claude', subStep.id, 'completed', 100);
      }

      const claudeAnalysis = await analyzeWithClaude(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));

      // Start synthesis
      setSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'in_progress' } : step
      ));

      // Synthesis sub-steps with progress simulation
      for (const subStep of steps[3].subSteps) {
        updateSubStepStatus('synthesis', subStep.id, 'in_progress', 0);
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          updateSubStepStatus('synthesis', subStep.id, 'in_progress', progress);
        }
        updateSubStepStatus('synthesis', subStep.id, 'completed', 100);
      }

      const synthesizedReport = await synthesizeReport({
        topic,
        gpt4Analysis: gpt4Analysis.content,
        geminiAnalysis: geminiAnalysis.content,
        claudeAnalysis: claudeAnalysis.content,
      });
      setReport(synthesizedReport);

      // Complete the synthesis step
      setSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'completed' } : step
      ));

    } catch (error) {
      console.error('Research failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showError(errorMessage);
      setReport(`# Error\n\nFailed to complete the research: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log('Downloading report...');
  };

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Super Tech Scout
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Research any emerging technology by querying multiple LLM APIs and get a unified report. Our tool combines insights from GPT-4, Gemini, and Claude to provide comprehensive analysis. Get detailed research reports with actionable insights in minutes.
          </p>
          <a 
            href="https://griffinarkilic.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            by Griffin Arkilic
          </a>
        </div>

        <SearchForm onSubmit={handleSearch} isLoading={isResearchInProgress} />
        
        <ProgressTracker steps={steps} />
        
        {report && steps[3].status === 'completed' && (
          <ReportDisplay 
            report={report} 
            onDownload={handleDownload} 
            isSynthesisComplete={true}
          />
        )}
      </div>
    </main>
  );
} 