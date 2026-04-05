/**
 * QwenOS configuration schema
 * Merged from qwen-only settings.json + black-bridges configs
 */

export interface QwenOSConfig {
  /** Version of config format */
  version: string;
  /** Primary workspace path */
  workspace: string;
  /** AI model configuration */
  model: ModelConfig;
  /** Agent registry settings */
  agents: AgentGlobalConfig;
  /** Memory/AgentDB settings */
  memory: MemoryConfig;
  /** Event bus settings */
  events: EventBusConfig;
  /** MCP server federation */
  mcp: MCPConfig;
  /** Hook definitions */
  hooks: HookConfig;
  /** Swarm coordination */
  swarm: SwarmConfig;
  /** Logging level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Feature flags */
  features: Record<string, boolean>;
}

export interface ModelConfig {
  /** Primary model provider */
  provider: string;
  /** Model name/identifier */
  name: string;
  /** Context window size */
  contextWindow?: number;
  /** Max tokens per response */
  maxTokens?: number;
  /** Temperature */
  temperature?: number;
  /** Fallback providers */
  fallbacks?: Array<{ provider: string; name: string }>;
}

export interface AgentGlobalConfig {
  /** Maximum concurrent agents */
  maxConcurrent: number;
  /** Default timeout in ms */
  defaultTimeout: number;
  /** Auto-spawn agents for tasks */
  autoSpawn: boolean;
  /** Agent log level */
  logLevel: string;
}

export interface MemoryConfig {
  /** Enable AgentDB */
  enabled: boolean;
  /** Database path */
  path: string;
  /** Enable HNSW vector search */
  hnsw: {
    enabled: boolean;
    efConstruction: number;
    M: number;
  };
  /** Namespace isolation */
  namespace: string;
}

export interface EventBusConfig {
  /** Transport mechanism */
  transport: 'local' | 'redis' | 'nats';
  /** Connection string (for remote transports) */
  url?: string;
  /** Enable CRDT conflict resolution */
  crdt: boolean;
  /** Event retention in ms */
  retention: number;
}

export interface MCPConfig {
  /** Enable MCP federation */
  enabled: boolean;
  /** Registered MCP servers */
  servers: Array<{
    name: string;
    url: string;
    transport: 'stdio' | 'http' | 'ws';
    tools?: string[];
  }>;
  /** Load balancing strategy */
  loadBalance: 'round-robin' | 'least-loaded' | 'semantic';
}

export interface HookConfig {
  /** Enable hooks */
  enabled: boolean;
  /** Hook definitions */
  hooks: Array<{
    event: string;
    handler: string;
    condition?: string;
  }>;
}

export interface SwarmConfig {
  /** Default topology */
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  /** Consensus protocol */
  consensus: 'raft' | 'bft' | 'gossip' | 'crdt';
  /** Maximum swarm size */
  maxSize: number;
  /** Health check interval in ms */
  healthCheckInterval: number;
}
