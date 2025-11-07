import 'dotenv/config';
import express from 'express';
import { mastra } from './mastra/index.js';
import { newsDigestAgent } from './mastra/agents/news-agent.js';

const app = express();
const PORT = process.env.PORT || 4111;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat endpoint with newsDigestAgent
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call your newsDigestAgent
    const result = await newsDigestAgent.generate(message);
    
    res.json({ 
      message: result.text,
      agent: 'newsDigestAgent'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { mastra };