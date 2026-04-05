/**
 * Agent types - unified registry from qwen-only (99), AOS (6), black-bridges
 * Deduplicated: single source of truth for all agent definitions
 */

export type AgentCategory =
  | 'core'          // coder, planner, researcher, reviewer, tester
  | 'github'        // PR manager, sync, code-review swarm
  | 'security'      // security reviewer, pentester bridge
  | 'swarm'         // swarm coordinators
  | 'optimization'  // performance, topology, resource
  | 'data'          // ML, data pipeline
  | 'v3'            // DDD, ADR, advanced architecture
  | 'analysis'      // code quality, bottleneck detection
  | 'automation'    // self-healing, smart agents
  | 'sparc'         // SPARC methodology agents
  | 'documentation' // API docs, doc updater
  | 'testing'       // TDD, e2e, validators
  | 'devops'        // CI/CD, deployment
  | 'monitoring'    // metrics, status, swarm monitor
  | 'aos';          // AOS runtime agents (adapted from Lua)

export type AgentState = 'idle' | 'running' | 'completed' | 'failed' | 'waiting';

export interface AgentConfig {
  /** Unique agent identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category grouping */
  category: AgentCategory;
  /** Description of capabilities */
  description: string;
  /** Maximum concurrent instances */
  maxInstances: number;
  /** Required tools/MCP servers */
  requiredTools?: string[];
  /** Environment overrides */
  env?: Record<string, string>;
  /** Tags for discovery */
  tags?: string[];
  /** Priority level (0-10) */
  priority?: number;
}

export interface Agent {
  config: AgentConfig;
  state: AgentState;
  /** Execute the agent's primary task */
  execute(task: string, context?: Record<string, unknown>): Promise<AgentResult>;
  /** Get current status snapshot */
  status(): AgentStatus;
  /** Cleanup resources */
  dispose(): Promise<void>;
}

export interface AgentStatus {
  id: string;
  state: AgentState;
  uptimeMs: number;
  tasksCompleted: number;
  lastActivity: Date;
  memoryUsageBytes: number;
}

export interface AgentResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, unknown>;
  durationMs: number;
}
