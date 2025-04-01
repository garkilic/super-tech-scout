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

interface Step {
  id: string;
  name: string;
  status: StepStatus;
}

export default function Home() {
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    { id: 'gpt4', name: 'GPT-4 Analysis', status: 'pending' },
    { id: 'gemini', name: 'Gemini Analysis', status: 'pending' },
    { id: 'claude', name: 'Claude Analysis', status: 'pending' },
    { id: 'synthesis', name: 'Report Synthesis', status: 'pending' },
  ]);

  const isResearchInProgress = isLoading || (report && steps[3].status !== 'completed');

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setReport(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));

    try {
      // Start GPT-4 analysis
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'in_progress' } : step
      ));
      const gpt4Analysis = await analyzeWithGPT4(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));

      // Start Gemini analysis
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'in_progress' } : step
      ));
      const geminiAnalysis = await analyzeWithGemini(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));

      // Start Claude analysis
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'in_progress' } : step
      ));
      const claudeAnalysis = await analyzeWithClaude(topic);
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));

      // Start synthesis
      setSteps(prev => prev.map((step, index) => 
        index === 3 ? { ...step, status: 'in_progress' } : step
      ));
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