import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { newsDigestAgent } from '../mastra/agents/news-agent.js';

/**
 * A2A Protocol Route Handler for Telex Integration
 * Implements proper A2A format with artifacts and history management
 */
export async function handleA2ARequest(req: Request, res: Response) {
  try {
    const agentId = req.params.agentId;
    const body = req.body;

    const { jsonrpc, id: requestId, method, params } = body;

    console.log(`📨 Received A2A request: ${method} for agent: ${agentId}`);
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate JSON-RPC 2.0 format
    if (jsonrpc !== '2.0' || !requestId) {
      console.error('Invalid JSON-RPC request');
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
      console.error(`Method not supported: ${method}`);
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
      console.error(`Agent not found: ${agentId}`);
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
    const { message, messages, contextId, taskId, metadata, configuration } = params || {};

    let messagesList = [];
    if (message) {
      messagesList = [message];
    } else if (messages && Array.isArray(messages)) {
      messagesList = messages;
    }

    // Convert A2A messages to text format for agent
    const userMessage = messagesList
      .map((msg: any) => {
        if (msg.parts && Array.isArray(msg.parts)) {
          return msg.parts
            .map((part: any) => {
              if (part.kind === 'text') return part.text;
              if (part.kind === 'data') return JSON.stringify(part.data);
              return '';
            })
            .join('\n');
        }
        return msg.text || '';
      })
      .join('\n');

    console.log(`👤 User message: "${userMessage}"`);

    // Call agent
    console.log('🤖 Calling agent.generate()...');
    const response = await agent.generate(userMessage);

    const agentText = response.text || '';

    console.log('✅ Agent response generated successfully');
    console.log('Response preview:', agentText.substring(0, 100) + '...');

    // Generate IDs
    const generatedTaskId = taskId || randomUUID();
    const generatedContextId = contextId || randomUUID();
    const responseMessageId = randomUUID();
    const artifactId = randomUUID();

    // Build artifacts array
    const artifacts = [
      {
        artifactId: artifactId,
        name: `${agentId}Response`,
        kind: 'artifact',
        parts: [
          {
            kind: 'text',
            text: agentText,
          },
        ],
      },
    ];

    // Add tool results as artifacts if available
    if (response.toolResults && Array.isArray(response.toolResults) && response.toolResults.length > 0) {
      artifacts.push({
        artifactId: randomUUID(),
        name: 'ToolResults',
        kind: 'artifact',
        parts: [
          {
            kind: 'text',
            text: JSON.stringify(response.toolResults, null, 2),
          },
        ],
      });
    }

    // Build conversation history
    const history = [
      // Include user messages in history
      ...messagesList.map((msg: any, index: number) => ({
        kind: 'message',
        role: msg.role || 'user',
        parts: msg.parts || [{ kind: 'text', text: msg.text || '' }],
        messageId: msg.messageId || randomUUID(),
        taskId: msg.taskId || generatedTaskId,
      })),
      // Add agent response to history
      {
        kind: 'message',
        role: 'agent',
        parts: [
          {
            kind: 'text',
            text: agentText,
          },
        ],
        messageId: responseMessageId,
        taskId: generatedTaskId,
      },
    ];

    // Return A2A-compliant response
    const a2aResponse = {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        id: generatedTaskId,
        contextId: generatedContextId,
        status: {
          state: 'completed',
          timestamp: new Date().toISOString(),
          message: {
            messageId: responseMessageId,
            role: 'agent',
            parts: [
              {
                kind: 'text',
                text: agentText,
              },
            ],
            kind: 'message',
          },
        },
        artifacts: artifacts,
        history: history,
        kind: 'task',
      },
    };

    console.log('✅ Sending A2A response');
    return res.json(a2aResponse);
  } catch (error) {
    console.error('❌ Error processing A2A request:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(500).json({
      jsonrpc: '2.0',
      id: 'unknown',
      error: {
        code: -32603,
        message: 'Internal error',
        data: { details: errorMessage },
      },
    });
  }
}

export default handleA2ARequest;