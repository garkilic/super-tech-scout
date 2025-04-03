import { NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:3000/api';

async function testOpenAIAPI() {
  console.log('Testing OpenAI API...');
  const response = await fetch(`${API_BASE_URL}/openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'quantum computing',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.content || typeof data.content !== 'string') {
    throw new Error('Invalid response format from OpenAI API');
  }

  console.log('OpenAI API tests passed!');
}

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  const response = await fetch(`${API_BASE_URL}/gemini`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'quantum computing',
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.content || typeof data.content !== 'string') {
    throw new Error('Invalid response format from Gemini API');
  }

  console.log('Gemini API tests passed!');
}

async function testClaudeAPI() {
  console.log('Testing Claude API...');
  const response = await fetch(`${API_BASE_URL}/claude`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: 'quantum computing',
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API failed with status: ${response.status}`);
  }

  const data = await response.json();
  if (!data.content || typeof data.content !== 'string') {
    throw new Error('Invalid response format from Claude API');
  }

  console.log('Claude API tests passed!');
}

async function testPDFGeneration() {
  console.log('Testing PDF Generation API...');
  const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: '# Test PDF\n\nThis is a test PDF content.',
    }),
  });

  if (!response.ok) {
    throw new Error(`PDF Generation API failed with status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType !== 'application/pdf') {
    throw new Error('Invalid content type from PDF Generation API');
  }

  console.log('PDF Generation API tests passed!');
}

async function runTests() {
  try {
    await testOpenAIAPI();
    await testGeminiAPI();
    await testClaudeAPI();
    await testPDFGeneration();
    console.log('All API tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTests(); 