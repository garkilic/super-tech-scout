'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import SearchForm from '../components/SearchForm';
import ProgressTracker from '../components/ProgressTracker';
import ReportDisplay from '../components/ReportDisplay';
import { analyzeTechnology as analyzeWithGPT4 } from '../services/chatgpt';
import { analyzeTechnology as analyzeWithGemini } from '../services/gemini';
import { synthesizeReport } from '../services/synthesis';

type StepStatus = 'pending' | 'in_progress' | 'completed';

interface Step {
  id: string;
  name: string;
  status: StepStatus;
}

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const { showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    { id: 'gpt4', name: 'GPT-4 Analysis', status: 'pending' },
    { id: 'gemini', name: 'Gemini Analysis', status: 'pending' },
    { id: 'synthesis', name: 'Report Synthesis', status: 'pending' },
  ]);

  const isResearchInProgress = isLoading || (report && steps[2].status !== 'completed');

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setReport(null);
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));

    try {
      // GPT-4 Analysis
      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'in_progress' } : step
      ));
      
      const gpt4Result = await analyzeWithGPT4(topic);
      if (gpt4Result.error) {
        throw new Error(`GPT-4 Analysis failed: ${gpt4Result.error}`);
      }

      setSteps(prev => prev.map((step, index) => 
        index === 0 ? { ...step, status: 'completed' } : step
      ));

      // Gemini Analysis
      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'in_progress' } : step
      ));
      
      const geminiResult = await analyzeWithGemini(topic);
      if (geminiResult.error) {
        throw new Error(`Gemini Analysis failed: ${geminiResult.error}`);
      }

      setSteps(prev => prev.map((step, index) => 
        index === 1 ? { ...step, status: 'completed' } : step
      ));

      // Synthesis
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'in_progress' } : step
      ));

      const synthesizedReport = await synthesizeReport({
        topic,
        gpt4Analysis: gpt4Result.content,
        geminiAnalysis: geminiResult.content,
      });

      // Store the report
      setReport(synthesizedReport);

      // Wait for 2 seconds to simulate synthesis progress
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete the synthesis step
      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Super Tech Scout</h2>
            <p className="mt-2 text-gray-300">Please enter the password to continue</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const password = formData.get('password') as string;
              login(password);
            }}
            className="mt-8 space-y-6"
          >
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              placeholder="Enter password"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
            Super Tech Scout
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Research any emerging technology by querying multiple LLM APIs and get a unified report. Our tool combines insights from GPT-4 and Claude to provide comprehensive analysis. Get detailed research reports with actionable insights in minutes.
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
        
        {report && steps[2].status === 'completed' && (
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