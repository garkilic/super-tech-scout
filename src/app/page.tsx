'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    { id: 'gpt4', name: 'GPT-4 Analysis', status: 'pending' },
    { id: 'gemini', name: 'Gemini Analysis', status: 'pending' },
    { id: 'synthesis', name: 'Report Synthesis', status: 'pending' },
  ]);

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

      setSteps(prev => prev.map((step, index) => 
        index === 2 ? { ...step, status: 'completed' } : step
      ));

      setReport(synthesizedReport);
    } catch (error) {
      console.error('Research failed:', error);
      setReport(`# Error\n\nFailed to complete the research: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Super Tech Scout</h2>
            <p className="mt-2 text-gray-600">Please enter the password to continue</p>
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Super Tech Scout</h1>
          <p className="text-xl text-gray-600">
            Research any emerging technology by querying multiple LLM APIs and get a unified report. Our tool combines insights from GPT-4 and Claude to provide comprehensive analysis. Get detailed research reports with actionable insights in minutes.
          </p>
        </div>

        <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
        
        <ProgressTracker steps={steps} />
        
        {report && <ReportDisplay report={report} onDownload={handleDownload} />}
      </div>
    </main>
  );
} 