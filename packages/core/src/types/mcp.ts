/**
 * MCP (Model Context Protocol) types - unified federation from black-bridges
 */

export interface MCPServer {
  /** Unique server identifier */
  id: string;
  /** Display name */
  name: string;
  /** Connection transport */
  transport: 'stdio' | 'http' | 'ws';
  /** Server URL or command */
  url: string;
  /** Available tools */
  tools: MCPTool[];
  /** Health status */
  status: 'connected' | 'disconnected' | 'error';
  /** Last heartbeat */
  lastHeartbeat?: Date;
}

export interface MCPTool {
  /** Unique tool name (server.tool format) */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** JSON Schema for input parameters */
  inputSchema: Record<string, unknown>;
  /** Server this tool belongs to */
  serverId: string;
  /** Tags for discovery */
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
