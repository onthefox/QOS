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
  | 'optimization'; // topology-optimize, parallel-execute, cache-manage

export interface CommandConfig {
  /** Command name (used in CLI invocation) */
  name: string;
  /** Category grouping */
  category: CommandCategory;
  /** Description */
  description: string;
  /** Path to implementation (.md spec or .ts handler) */
  handler: string;
  /** Accepts arguments */
  acceptsArgs: boolean;
  /** Argument schema (Zod-compatible) */
  argsSchema?: Record<string, { type: string; required: boolean; description: string }>;
  /** Alias names for backward compatibility */
  aliases?: string[];
  /** Requires running agent instance */
  requiresAgent?: boolean;
  /** Requires active workspace */
  requiresWorkspace?: boolean;
}

export interface Command {
  config: CommandConfig;
  /** Execute command with given arguments */
  execute(args: Record<string, unknown>, context: CommandContext): Promise<CommandResult>;
  /** Validate arguments before execution */
  validate(args: Record<string, unknown>): { valid: boolean; errors: string[] };
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
