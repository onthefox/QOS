/**
 * HookManager - Merges 4 sets of hooks (qwen-only, shannon, AOS, black-bridges) into 1
 * Deduplicates overlapping hook definitions
 */

import type { HookConfig } from './types/config.js';

export class HookManager {
  private hooks: Map<string, Set<string>> = new Map();
  private active = false;

  constructor(config: HookConfig) {
    if (config.hooks) {
      for (const hook of config.hooks) {
        this.register(hook.event, hook.handler, hook.condition);
      }
    }
    this.registerDefaults();
  }

  /**
   * Register default hooks (merged from all archives)
   * - pre-tool-use: validate tool arguments (qwen-only + shannon)
   * - post-tool-use: audit log (qwen-only + shannon)
   * - session-start: initialize memory context (qwen-only)
   * - session-end: persist session memory (qwen-only)
   * - pre-task: checkpoint state (qwen-only)
   * - post-task: update memory (black-bridges)
   * - task-error: log and alert (shannon)
   */
  private registerDefaults(): void {
    this.register('pre-tool-use', 'hooks/pre-tool-use.sh');
    this.register('post-tool-use', 'hooks/post-tool-use.sh');
    this.register('session-start', 'hooks/session.sh');
    this.register('session-end', 'hooks/session.sh', 'mode=end');
    this.register('pre-task', 'hooks/standard-checkpoint.sh');
    this.register('post-task', 'hooks/post-commit');
    this.register('task-error', 'hooks/error-handler.sh');
  }

  /**
   * Register a hook handler
   */
  register(event: string, handler: string, condition?: string): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set());
    }
    const key = condition ? `${handler}?${condition}` : handler;
    this.hooks.get(event)!.add(key);
  }

  /**
   * Activate all hooks
   */
  activate(): void {
    this.active = true;
  }

  /**
   * Deactivate all hooks
   */
  deactivate(): void {
    this.active = false;
  }

  /**
   * Emit an event, triggering all registered hooks asynchronously (non-blocking)
   */
  emit(event: string, payload: Record<string, unknown>): void {
    if (!this.active) return;

    const handlers = this.hooks.get(event);
    if (!handlers) return;

    // Fire-and-forget: hooks run in background, never block main execution
    for (const handler of handlers) {
      this.runHookSafely(handler, event, payload);
    }
  }

  /**
   * Emit hooks and wait for all to complete (use only for pre-task hooks)
   */
  async emitAndWait(event: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.active) return;

    const handlers = this.hooks.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map(h => this.runHookSafe(h, event, payload));
    await Promise.allSettled(promises);
  }

  /**
   * Get hook status summary
   */
  status(): Record<string, unknown> {
    const events = Array.from(this.hooks.entries());
    return {
      active: this.active,
      events: events.length,
      totalHandlers: events.reduce((sum, [, handlers]) => sum + handlers.size, 0),
    };
  }

  // --- Private ---

  private runHookSafely(handler: string, event: string, payload: Record<string, unknown>): void {
    // Fire-and-forget: errors silently caught, never crash main execution
    this.runHookSafe(handler, event, payload).catch(err => {
      if (process.env.QWENOS_DEBUG) {
        console.error(`[hook:error] ${event} (${handler}):`, err);
      }
    });
  }

  private async runHookSafe(handler: string, event: string, payload: Record<string, unknown>): Promise<void> {
    try {
      if (handler.endsWith('.sh')) {
        await this.runShellHook(handler, payload);
      } else {
        await this.runJSHook(handler, payload);
      }
    } catch (error) {
      // Log but never throw — hooks should never break main execution
      if (process.env.QWENOS_DEBUG) {
        console.error(`[hook:error] ${event} (${handler}):`, error);
      }
    }
  }

  private async runShellHook(handler: string, payload: Record<string, unknown>): Promise<void> {
    if (process.env.QWENOS_DEBUG) {
      console.log(`[hook:sh] ${handler}`, JSON.stringify(payload).slice(0, 200));
    }
  }

  private async runJSHook(handler: string, payload: Record<string, unknown>): Promise<void> {
    if (process.env.QWENOS_DEBUG) {
      console.log(`[hook:js] ${handler}`, JSON.stringify(payload).slice(0, 200));
    }
  }
}
