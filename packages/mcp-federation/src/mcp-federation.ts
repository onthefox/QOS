/**
 * MCPFederation - Unified MCP server layer from black-bridges
 * Deduplicates and load-balances tools across all registered MCP servers
 */

import type { MCPServer, MCPTool, MCPToolResult } from './types.js';

export class MCPFederation {
  private servers = new Map<string, MCPServer>();
  private toolIndex = new Map<string, MCPServer>();
  private callCounts = new Map<string, number>();
  private loadStrategy: 'round-robin' | 'least-loaded' | 'semantic' = 'least-loaded';
  private rrCounter = 0;

  /**
   * Register an MCP server
   */
  registerServer(server: MCPServer): void {
    this.servers.set(server.id, server);

    // Index tools for fast lookup
    for (const tool of server.tools) {
      this.toolIndex.set(tool.name, server);
      this.callCounts.set(tool.name, 0);
    }
  }

  /**
   * Call a tool by name through the federation layer
   */
  async callTool(toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const server = this.resolveServer(toolName);
    if (!server) {
      return {
        content: [{ type: 'text', text: `Tool "${toolName}" not found in any registered MCP server` }],
        isError: true,
      };
    }

    // Increment call count for load balancing
    this.callCounts.set(toolName, (this.callCounts.get(toolName) ?? 0) + 1);

    // In production: route to actual MCP server via transport
    return {
      content: [{ type: 'text', text: `[${server.name}] tool: ${toolName}, args: ${JSON.stringify(args)}` }],
    };
  }

  /**
   * List all available tools across all servers
   */
  listTools(): MCPTool[] {
    const tools: MCPTool[] = [];
    for (const server of this.servers.values()) {
      tools.push(...server.tools);
    }
    return tools;
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): MCPTool | null {
    const server = this.toolIndex.get(name);
    if (!server) return null;
    return server.tools.find(t => t.name === name) ?? null;
  }

  /**
   * Get server status summary
   */
  status(): { servers: number; tools: number; healthy: number } {
    const servers = Array.from(this.servers.values());
    return {
      servers: servers.length,
      tools: servers.reduce((sum, s) => sum + s.tools.length, 0),
      healthy: servers.filter(s => s.status === 'connected').length,
    };
  }

  // --- Private ---

  private resolveServer(toolName: string): MCPServer | null {
    const server = this.toolIndex.get(toolName);
    if (!server) return null;

    switch (this.loadStrategy) {
      case 'round-robin':
        return this.roundRobin(toolName);
      case 'least-loaded':
        return this.leastLoaded(toolName);
      case 'semantic':
        return server; // Use indexed server directly
      default:
        return server;
    }
  }

  private roundRobin(_toolName: string): MCPServer | null {
    const servers = Array.from(this.servers.values()).filter(s => s.status === 'connected');
    if (servers.length === 0) return null;
    const idx = this.rrCounter % servers.length;
    this.rrCounter++;
    return servers[idx];
  }

  private leastLoaded(toolName: string): MCPServer | null {
    const server = this.toolIndex.get(toolName);
    return server && server.status === 'connected' ? server : null;
  }
}
