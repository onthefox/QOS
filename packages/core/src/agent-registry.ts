/**
 * AgentRegistry - Single source of truth for all 105 agents
 * Deduplicates qwen-only (99) + AOS (6) + black-bridges agents
 */

import { buildAgents } from './agents/index.js';
import type { Agent, AgentConfig, AgentState } from './types/agent.js';
import type { QwenOSConfig } from './types/config.js';

export class AgentRegistry {
  private agents = new Map<string, Agent>();
  private configs = new Map<string, AgentConfig>();

  /**
   * Register all agents from the unified catalog
   * Uses buildAgents() to create 105 real agent instances
   * Deduplicates overlapping definitions automatically
   */
  async registerAll(_config: QwenOSConfig): Promise<void> {
    const agentList = buildAgents();

    for (const agent of agentList) {
      if (this.configs.has(agent.config.id)) continue; // Dedup guard
      this.configs.set(agent.config.id, agent.config);
    }
  }

  /**
   * Spawn an agent instance
   */
  async spawn(name: string, _config?: Record<string, unknown>): Promise<Agent> {
    const agentConfig = this.configs.get(name);
    if (!agentConfig) {
      throw new Error(`Agent "${name}" not registered`);
    }

    const existing = this.agents.get(name);
    if (existing) {
      return existing;
    }

    const agent = await this.createAgent(agentConfig);
    this.agents.set(name, agent);
    return agent;
  }

  /**
   * Get a registered agent by name
   */
  get(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  /**
   * List all registered agents
   */
  list(category?: string): Array<{ id: string; name: string; category: string; description: string; state: AgentState }> {
    const entries = Array.from(this.configs.entries());
    const filtered = category ? entries.filter(([, c]) => c.category === category) : entries;

    return filtered.map(([id, config]) => ({
      id,
      name: config.name,
      category: config.category,
      description: config.description,
      state: this.agents.get(id)?.state ?? 'idle',
    }));
  }

  /**
   * Get total agent count
   */
  get count(): number {
    return this.configs.size;
  }

  /**
   * Get status summary
   */
  status(): Record<string, unknown> {
    const agents = Array.from(this.agents.values());
    return {
      total: this.configs.size,
      active: agents.filter(a => a.state === 'running').length,
      idle: agents.filter(a => a.state === 'idle').length,
      failed: agents.filter(a => a.state === 'failed').length,
    };
  }

  /**
   * Dispose all agents
   */
  async disposeAll(): Promise<void> {
    const promises = Array.from(this.agents.values()).map(a => a.dispose());
    await Promise.allSettled(promises);
    this.agents.clear();
  }

  // --- Private ---

  // No longer needed — agents built by buildAgents()
}
