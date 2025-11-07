import { registerApiRoute } from '@mastra/core/server';
import { newsDigestAgent } from '../mastra/agents/news-agent.js';

/**
 * A2A Protocol Route Handler for Telex Integration
 */
export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    try {
      const agentId = c.req.param('agentId');
      const body = await c.req.json();
      
      const { jsonrpc, id: requestId, method, params } = body;
      
      console.log(`📨 Received A2A request: ${method} for agent: ${agentId}`);
      console.log('Request body:', JSON.stringify(body, null, 2));
      
      // Validate JSON-RPC 2.0
      if (jsonrpc !== '2.0' || !requestId) {
        console.error('Invalid JSON-RPC request');
        return c.json({
          jsonrpc: '2.0',
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0" and id is required',
          },
        }, 400);
      }
      
      // Validate method
      if (method !== 'message/send') {
        console.error(`Method not supported: ${method}`);
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32601,
            message: 'Method not found: Only "message/send" is supported',
          },
        }, 400);
      }
      
      // Map agent ID to actual agent
      let agent;
      if (agentId === 'newsDigestAgent' || agentId === 'news-digest-agent') {
        agent = newsDigestAgent;
      }
      
      if (!agent) {
        console.error(`Agent not found: ${agentId}`);
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found. Available: newsDigestAgent`,
          },
        }, 404);
      }
      
      // Extract message from params
      const message = params?.message?.parts?.[0]?.text || params?.message || 'Hello';
      
      console.log(`👤 User message: "${message}"`);
      
      // Call agent
      console.log('🤖 Calling agent.generate()...');
      const response = await agent.generate(message);
      
      console.log('✅ Agent response generated successfully');
      console.log('Response text:', response.text.substring(0, 100) + '...');
      
      // Return A2A response
      return c.json({
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
      }, 200);
      
    } catch (error) {
      console.error('❌ Error processing A2A request:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return c.json({
        jsonrpc: '2.0',
        id: 'unknown',
        error: {
          code: -32603,
          message: `Internal error: ${errorMessage}`,
        },
      }, 500);
    }
  },
});