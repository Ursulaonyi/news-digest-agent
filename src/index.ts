import 'dotenv/config';
import express from 'express';
import { mastra } from './mastra/index.js';
import { newsDigestAgent } from './mastra/agents/news-agent.js';
import { a2aAgentRoute } from './routes/a2a-agent-route.js';

const app = express();
const PORT = process.env.PORT || 4111;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add this endpoint for browser testing
app.get('/api/chat', (req, res) => {
  res.json({ 
    message: 'Use POST request with {"message":"your query"} body',
    example: 'curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat -H "Content-Type: application/json" -d \'{"message":"Give me tech news"}\''
  });
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

// Mount A2A route
app.post('/a2a/agent/:agentId', async (req, res) => {
  try {
    const agentId = req.params.agentId;
    const body = req.body;
    
    const { jsonrpc, id: requestId, method, params } = body;
    
    console.log(`📨 Received A2A request: ${method} for agent: ${agentId}`);
    
    // Validate JSON-RPC 2.0
    if (jsonrpc !== '2.0' || !requestId) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: requestId || null,
        error: {
          code: -32600,
          message: 'Invalid Request: jsonrpc must be "2.0" and id is required',
        },
      });
    }
    
    // Validate method
    if (method !== 'message/send') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32601,
          message: 'Method not found: Only "message/send" is supported',
        },
      });
    }
    
    // Map agent ID to actual agent
    let agent;
    if (agentId === 'newsDigestAgent' || agentId === 'news-digest-agent') {
      agent = newsDigestAgent;
    }
    
    if (!agent) {
      return res.status(404).json({
        jsonrpc: '2.0',
        id: requestId,
        error: {
          code: -32602,
          message: `Agent '${agentId}' not found. Available: newsDigestAgent`,
        },
      });
    }
    
    // Extract message from params - handle multiple formats
    let message = 'Hello';
    
    if (params?.message?.parts?.[0]?.text) {
      message = params.message.parts[0].text;
    } else if (typeof params?.message === 'string') {
      message = params.message;
    } else if (params?.content) {
      message = params.content;
    } else if (typeof params === 'string') {
      message = params;
    }
    
    console.log(`👤 User message: "${message}"`);
    
    // Call agent
    console.log('🤖 Calling agent.generate()...');
    const response = await agent.generate(message);
    
    console.log('✅ Agent response generated successfully');
    
    // Return A2A response
    return res.json({
      jsonrpc: '2.0',
      id: requestId,
      result: {
        message: {
          role: 'assistant',
          parts: [
            {
              kind: 'text',
              text: response.text,
            },
          ],
        },
      },
    });
    
  } catch (error) {
    console.error('❌ Error processing A2A request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({
      jsonrpc: '2.0',
      id: 'unknown',
      error: {
        code: -32603,
        message: `Internal error: ${errorMessage}`,
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { mastra };