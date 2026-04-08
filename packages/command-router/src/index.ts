export interface Command {
  name: string;
  description: string;
  handler: (args: string[]) => Promise<string>;
}

export class CommandRouter {
  private commands: Map<string, Command> = new Map();

  register(command: Command): void {
    this.commands.set(command.name, command);
  }

  async route(input: string): Promise<Command | null> {
    const [name, ...args] = input.trim().split(/\s+/);
    const command = this.commands.get(name);
    if (!command) return null;
    return command;
  }

  async execute(input: string): Promise<string> {
    const command = await this.route(input);
    if (!command) throw new Error(`Unknown command: ${input.split(' ')[0]}`);
    const args = input.trim().split(/\s+/).slice(1);
    return command.handler(args);
  }

  list(): Command[] {
    return Array.from(this.commands.values());
  }
}
