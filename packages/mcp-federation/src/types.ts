export interface MCPServer {
  id: string;
  name: string;
  transport: 'stdio' | 'http' | 'ws';
  url: string;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
  lastHeartbeat?: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverId: string;
  tags?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export interface MCPToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}
