const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testClaudeAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: 'quantum computing' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData.error);
      return;
    }

    const data = await response.json();
    console.log('Claude API Response:', data.content);
  } catch (error) {
    console.error('Error testing Claude API:', error);
  }
}

testClaudeAPI(); 