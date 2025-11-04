import { registerApiRoute } from '@mastra/core/server';

/**
 * A2A Protocol Route Handler for Telex Integration
 */
export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');
      const body = await c.req.json();
      
      const { jsonrpc, id: requestId, method, params } = body;
      
      // Validate JSON-RPC 2.0
      if (jsonrpc !== '2.0' || !requestId) {
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
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32601,
            message: 'Method not found: Only "message/send" is supported',
          },
        }, 400);
      }
      
      // Get agent
      const agent = mastra.getAgent(agentId);
      
      if (!agent) {
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found`,
          },
        }, 404);
      }
      
      // Extract message from params
      const message = params?.message?.parts?.[0]?.text || params?.message || 'Hello';
      
      console.log(`User message: "${message}"`);
      
      // Call agent
      const response = await agent.generate(message);
      
      console.log('Agent response generated successfully');
      
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
      console.error('Error processing A2A request:', error);
      
      return c.json({
        jsonrpc: '2.0',
        id: 'unknown',
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      }, 500);
    }
  },
});
