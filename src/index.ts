import 'dotenv/config';
import express from 'express';
import { mastra } from './mastra/index.js';
import { newsDigestAgent } from './mastra/agents/news-agent.js';
import handleA2ARequest from './routes/a2a-agent-route.js';

const app = express();
const PORT = process.env.PORT || 4111;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Chat endpoint (for testing)
app.get('/api/chat', (req, res) => {
  res.json({
    message: 'Use POST request with {"message":"your query"} body',
    example: 'curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat -H "Content-Type: application/json" -d \'{"message":"Give me tech news"}\'',
  });
});

// REST Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call newsDigestAgent
    const result = await newsDigestAgent.generate(message);

    res.json({
      message: result.text,
      agent: 'newsDigestAgent',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// A2A Protocol endpoint for Telex integration
app.post('/a2a/agent/:agentId', handleA2ARequest);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { mastra };