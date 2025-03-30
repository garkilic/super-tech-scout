import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { analyzeTechnology as analyzeWithGPT4 } from '../services/chatgpt';
import { analyzeTechnology as analyzeWithGemini } from '../services/gemini';
import { analyzeTechnology as analyzeWithClaude } from '../services/claude';

async function testAPI(name: string, apiCall: (topic: string) => Promise<any>) {
  console.log(`\nTesting ${name} API...`);
  try {
    const result = await apiCall('quantum computing');
    if (result.error) {
      console.error(`❌ ${name} API Error:`, result.error);
      return false;
    }
    if (!result.content) {
      console.error(`❌ ${name} API Error: No content returned`);
      return false;
    }
    console.log(`✅ ${name} API Success!`);
    console.log('Sample response:', result.content.substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error(`❌ ${name} API Error:`, error);
    return false;
  }
}

async function testAllAPIs() {
  console.log('Starting API tests...\n');
  
  const results = {
    gpt4: await testAPI('GPT-4', analyzeWithGPT4),
    gemini: await testAPI('Gemini', analyzeWithGemini),
    claude: await testAPI('Claude', analyzeWithClaude),
  };

  console.log('\nTest Results:');
  console.log('-------------');
  Object.entries(results).forEach(([api, success]) => {
    console.log(`${api}: ${success ? '✅' : '❌'}`);
  });

  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall Status:', allPassed ? '✅ All APIs working' : '❌ Some APIs failed');
}

// Run the tests
testAllAPIs().catch(console.error); 