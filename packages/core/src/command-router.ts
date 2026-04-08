/**
 * CommandRouter - Deduplicates 80+ qwen-only .md commands into 25 routed commands
 * Single entry point with alias resolution
 */

import { buildCommands } from './commands/index.js';
import type { Command, CommandContext, CommandResult } from './types/command.js';

export class CommandRouter {
  private commands = new Map<string, Command>();
  private aliases = new Map<string, string>();

  /**
   * Register all commands from the unified catalog
   * Uses buildCommands() to create 25 real command instances
   * Automatically resolves duplicates and sets up aliases
   */
  async registerAll(): Promise<void> {
    const cmdList = buildCommands();

    for (const cmd of cmdList) {
      if (this.commands.has(cmd.name)) continue; // Dedup guard
      this.commands.set(cmd.name, cmd);

      // Register aliases
      for (const alias of (cmd.aliases ?? [])) {
        this.aliases.set(alias, cmd.name);
      }
    }
  }

  /**
   * Execute a command by name with argument validation
   */
  async execute(name: string, args: Record<string, unknown>, context: CommandContext): Promise<CommandResult> {
    const resolved = this.resolveName(name);
    const cmd = this.commands.get(resolved);

    if (!cmd) {
      return {
        success: false,
        output: '',
        error: `Command "${name}" not found. Run "qos help" for available commands.`,
        durationMs: 0,
      };
    }

    const start = Date.now();
    try {
      return await cmd.execute(args, context);
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: err,
        durationMs: Date.now() - start,
      };
    }
  }

  /**
   * List all commands (with optional category filter)
   */
  list(category?: string): Array<{ name: string; category: string; description: string; aliases: string[] }> {
    const entries = Array.from(this.commands.values());
    const filtered = category ? entries.filter(c => c.config.category === category) : entries;

    return filtered.map(c => ({
      name: c.config.name,
      category: c.config.category,
      description: c.config.description,
      aliases: c.config.aliases ?? [],
    }));
  }

  /**
   * Get command count
   */
  get count(): number {
    return this.commands.size;
  }

  /**
   * Get status summary
   */
  status(): Record<string, unknown> {
    return {
      total: this.commands.size,
      aliases: this.aliases.size,
      categories: new Set(Array.from(this.commands.values()).map(c => c.config.category)).size,
    };
  }

  // --- Private ---

  private resolveName(name: string): string {
    return this.aliases.get(name) ?? name;
  }
}
