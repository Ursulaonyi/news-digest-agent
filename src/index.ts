import 'dotenv/config';
import express from 'express';
import { mastra } from './mastra/index.js';

const app = express();
const PORT = process.env.PORT || 4111;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// You can add your mastra routes here
// For now, just a basic endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Your mastra agent logic here
    res.json({ message: 'API working' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { mastra };