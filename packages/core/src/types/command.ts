/**
 * Command types - deduplicated from 80+ qwen-only .md commands to 25 routed commands
 * Each command maps to a single implementation, no duplicates
 */

export type CommandCategory =
  | 'core'          // plan, orchestrate, verify, checkpoint
  | 'analysis'      // bottleneck-detect, performance-report, token-usage
  | 'github'        // pr-manager, code-review, sync-coordinator
  | 'sparc'         // spec, pseudocode, refinement, architecture
  | 'automation'    // smart-agents, self-healing, session-memory
  | 'monitoring'    // status, metrics, swarm-monitor
  | 'optimization'  // topology-optimize, parallel-execute, cache-manage
  | 'system'        // help, status, agents, commands, skills, version, doctor, config
  | 'execution'     // run, execute, workflow, sparc-spec
  | 'memory'        // memory (store, get, search, delete, stats)
  | 'swarm'         // swarm, spawn
  | 'security'      // security-scan
  | 'testing'       // test
  | 'devops'        // build, deploy
  | 'documentation'; // sparc-spec

export interface Command {
  /** Command name (used in CLI invocation) */
  name: string;
  /** Category grouping */
  category: CommandCategory;
  /** Description */
  description: string;
  /** Alias names for backward compatibility */
  aliases?: string[];
  /** Execute command with given arguments */
  execute(args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
}

export interface CommandContext {
  workspace?: string;
  agentId?: string;
  sessionId?: string;
  env: Record<string, string>;
  /** Access to memory */
  memory?: { search: (q: string) => Promise<unknown[]>; store: (k: string, v: unknown) => Promise<void> };
  /** Access to event bus */
  events?: { emit: (type: string, payload: unknown) => Promise<void> };
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  metadata?: Record<string, unknown>;
  durationMs: number;
}
