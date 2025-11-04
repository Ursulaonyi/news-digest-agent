// A2A Protocol Types based on JSON-RPC 2.0

export interface A2AMessagePart {
  kind: 'text';
  text: string;
}

export interface A2AMessage {
  role: 'user' | 'assistant';
  parts: A2AMessagePart[];
}

export interface A2ARequest {
  jsonrpc: '2.0';
  id: string;
  method: 'message/send';
  params: {
    message: A2AMessage;
    userId?: string;
    channelId?: string;
    messageId?: string;
    metadata?: any;
  };
}

export interface A2AResponse {
  jsonrpc: '2.0';
  id: string;
  result: {
    message: {
      role: 'assistant';
      parts: A2AMessagePart[];
    };
    history?: A2AMessage[];
    artifacts?: any[];
  };
}

export interface A2AError {
  jsonrpc: '2.0';
  id: string;
  error: {
    code: number;
    message: string;
  };
}