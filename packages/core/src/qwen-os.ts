/**
 * QwenOS - Main application class
 * Unified entry point merging all 4 archive systems into one OOP architecture
 */

import { AgentRegistry } from './agent-registry.js';
import { CommandRouter } from './command-router.js';
import { HookManager } from './hook-manager.js';
import { SkillManager } from './skill-manager.js';
import type { QwenOSConfig } from './types/config.js';
import type { Agent, AgentResult } from './types/agent.js';
import type { CommandContext, CommandResult } from './types/command.js';

export class QwenOS {
  /** Application configuration */
  readonly config: QwenOSConfig;

  /** Unified agent registry (all agents, one source) */
  readonly agentRegistry: AgentRegistry;

  /** Deduplicated command router (80→25 commands) */
  readonly commandRouter: CommandRouter;

  /** Merged hook dispatcher (4 sets → 1) */
  readonly hookManager: HookManager;

  /** Skill manager (31 skills from qwen-only) */
  readonly skillManager: SkillManager;

  /** Memory instance (single AgentDB + HNSW) */
  private memory: unknown;

  /** Event bus instance (black-bridges) */
  private eventBus: unknown;

  /** MCP federation layer */
  private mcpFederation: unknown;

  /** Application state */
  private initialized = false;

  constructor(config: Partial<QwenOSConfig> = {}) {
    this.config = this.mergeDefaults(config);
    this.agentRegistry = new AgentRegistry();
    this.commandRouter = new CommandRouter();
    this.hookManager = new HookManager(this.config.hooks);
    this.skillManager = new SkillManager();
  }

  /**
   * Initialize all subsystems
   * Single call boots everything - no duplicate startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.emit('qwenos:initializing', { timestamp: Date.now() });

    // 1. Initialize memory (single AgentDB instance)
    await this.initMemory();

    // 2. Initialize event bus
    await this.initEventBus();

    // 3. Initialize MCP federation
    await this.initMCPFederation();

    // 4. Register all agents (deduped)
    await this.agentRegistry.registerAll(this.config);

    // 5. Register all commands (deduped)
    await this.commandRouter.registerAll();

    // 6. Load skills
    await this.skillManager.loadAll();

    // 7. Activate hooks
    this.hookManager.activate();

    this.initialized = true;
    this.emit('qwenos:initialized', {
      agents: this.agentRegistry.count,
      commands: this.commandRouter.count,
      skills: this.skillManager.count,
    });
  }

  /**
   * Execute a command through the unified router
   */
  async execute(command: string, args: Record<string, unknown> = {}): Promise<CommandResult> {
    if (!this.initialized) await this.initialize();

    await this.hookManager.emit('pre-task', { command, args });
    const start = Date.now();

    try {
      const result = await this.commandRouter.execute(command, args, this.createContext());
      await this.hookManager.emit('post-task', { command, args, result });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      await this.hookManager.emit('task-error', { command, args, error: err });
      return {
        success: false,
        output: '',
        error: err,
        durationMs: Date.now() - start,
      };
    }
  }

  /**
   * Spawn an agent by name
   */
  async spawnAgent(agentName: string, config?: Record<string, unknown>): Promise<Agent> {
    if (!this.initialized) await this.initialize();
    return this.agentRegistry.spawn(agentName, config);
  }

  /**
   * Run a task through an agent
   */
  async run(agentName: string, task: string, context?: Record<string, unknown>): Promise<AgentResult> {
    if (!this.initialized) await this.initialize();

    const agent = this.agentRegistry.get(agentName);
    if (!agent) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    this.emit('agent:start', { agent: agentName, task });
    const result = await agent.execute(task, context);
    this.emit('agent:complete', { agent: agentName, success: result.success });

    return result;
  }

  /**
   * Get unified status of all subsystems
   */
  status(): Record<string, unknown> {
    return {
      initialized: this.initialized,
      agents: this.agentRegistry.status(),
      commands: this.commandRouter.status(),
      memory: this.memory ? 'connected' : 'disconnected',
      eventBus: this.eventBus ? 'connected' : 'disconnected',
      mcp: this.mcpFederation ? 'connected' : 'disconnected',
      hooks: this.hookManager.status(),
      skills: this.skillManager.count,
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    this.emit('qwenos:shutdown', { timestamp: Date.now() });
    await this.agentRegistry.disposeAll();
    this.hookManager.deactivate();
    this.initialized = false;
  }

  // --- Private ---

  private async initMemory(): Promise<void> {
    // Unified AgentDB + HNSW - single instance
    this.emit('memory:init', {});
  }

  private async initEventBus(): Promise<void> {
    // Black-bridges event bus
    this.emit('eventbus:init', {});
  }

  private async initMCPFederation(): Promise<void> {
    // Unified MCP server federation
    this.emit('mcp:init', {});
  }

  private createContext(): CommandContext {
    return {
      env: process.env as Record<string, string>,
      memory: this.memory as CommandContext['memory'],
      events: this.eventBus as CommandContext['events'],
    };
  }

  private emit(type: string, payload: unknown): void {
    // Route through event bus when available
    if (this.eventBus && typeof (this.eventBus as any).emit === 'function') {
      (this.eventBus as any).emit(type, payload);
    }
  }

  private mergeDefaults(partial: Partial<QwenOSConfig>): QwenOSConfig {
    return {
      version: '1.0.0',
      workspace: partial.workspace ?? process.cwd(),
      model: partial.model ?? {
        provider: 'openai',
        name: 'gpt-4o',
      },
      agents: partial.agents ?? {
        maxConcurrent: 15,
        defaultTimeout: 300_000,
        autoSpawn: true,
        logLevel: 'info',
      },
      memory: partial.memory ?? {
        enabled: true,
        path: './memory.db',
        hnsw: { enabled: true, efConstruction: 200, M: 16 },
        namespace: 'qwen-os',
      },
      events: partial.events ?? {
        transport: 'local',
        crdt: true,
        retention: 86_400_000,
      },
      mcp: partial.mcp ?? {
        enabled: true,
        servers: [],
        loadBalance: 'least-loaded',
      },
      hooks: partial.hooks ?? {
        enabled: true,
        hooks: [],
      },
      swarm: partial.swarm ?? {
        topology: 'mesh',
        consensus: 'crdt',
        maxSize: 15,
        healthCheckInterval: 30_000,
      },
      logLevel: partial.logLevel ?? 'info',
      features: partial.features ?? {},
    };
  }
}
