#!/usr/bin/env node
/**
 * QwenOS CLI - Unified entry point (`qos` command)
 * Single interface for all agents, commands, and tools
 */

import { QwenOS } from '@qwenos/core';
import type { QwenOSConfig } from '@qwenos/core';

const VERSION = '1.0.0';

const ASCII_ART = `
  ██╗   ██╗██╗ ██████╗ ██████╗ 
  ██║   ██║██║██╔════╝██╔═══██╗
  ██║   ██║██║██║     ██║   ██║
  ╚██╗ ██╔╝██║██║     ██║   ██║
   ╚████╔╝ ██║╚██████╗╚██████╔╝
    ╚═══╝  ╚═╝ ╚═════╝ ╚═════╝ 

  QwenOS v${VERSION} - Unified Agent Operating System
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? 'help';

  if (command === '--version' || command === '-v') {
    console.log(`qos v${VERSION}`);
    return;
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'init') {
    await cmdInit(args.slice(1));
    return;
  }

  if (command === 'status') {
    await cmdStatus();
    return;
  }

  if (command === 'agents') {
    await cmdAgents(args.slice(1));
    return;
  }

  if (command === 'commands') {
    await cmdCommands();
    return;
  }

  if (command === 'run') {
    await cmdRun(args.slice(1));
    return;
  }

  if (command === 'execute' || command === 'exec') {
    await cmdExecute(args.slice(1));
    return;
  }

  if (command === 'skills') {
    await cmdSkills();
    return;
  }

  // Unknown command
  console.log(`Unknown command: ${command}\nRun "qos help" for usage.`);
  process.exit(1);
}

// --- Commands ---

async function cmdInit(args: string[]): Promise<void> {
  const workspace = args[0] ?? process.cwd();
  console.log(`🚀 Initializing QwenOS workspace: ${workspace}`);

  const os = new QwenOS({ workspace } as Partial<QwenOSConfig>);
  await os.initialize();

  const status = os.status();
  console.log(`✅ Initialized successfully`);
  console.log(`   Agents:   ${status.agents}`);
  console.log(`   Commands: ${status.commands}`);
  console.log(`   Skills:   ${status.skills}`);

  await os.shutdown();
}

async function cmdStatus(): Promise<void> {
  const os = new QwenOS();
  await os.initialize();

  const status = os.status();
  console.log(ASCII_ART);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           QwenOS Status Dashboard                    ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║ Initialized:  ${String(status.initialized).padEnd(40)} ║`);
  console.log(`║ Agents:       ${JSON.stringify(status.agents).padEnd(40).slice(0, 40)} ║`);
  console.log(`║ Commands:     ${JSON.stringify(status.commands).padEnd(40).slice(0, 40)} ║`);
  console.log(`║ Memory:       ${String(status.memory).padEnd(40)} ║`);
  console.log(`║ Event Bus:    ${String(status.eventBus).padEnd(40)} ║`);
  console.log(`║ MCP Servers:  ${JSON.stringify(status.mcp).padEnd(40).slice(0, 40)} ║`);
  console.log(`║ Hooks:        ${JSON.stringify(status.hooks).padEnd(40).slice(0, 40)} ║`);
  console.log(`║ Skills:       ${String(status.skills).padEnd(40)} ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  await os.shutdown();
}

async function cmdAgents(args: string[]): Promise<void> {
  const os = new QwenOS();
  await os.initialize();

  const category = args[0];
  const agents = os.agentRegistry.list(category);

  console.log(`\n📋 Agents (${agents.length} total):\n`);
  console.log(`${'ID'.padEnd(30)} ${'Category'.padEnd(15)} ${'State'.padEnd(10)} Description`);
  console.log('─'.repeat(90));

  for (const agent of agents) {
    console.log(
      `${agent.id.padEnd(30)} ${agent.category.padEnd(15)} ${agent.state.padEnd(10)} ${agent.description}`
    );
  }

  await os.shutdown();
}

async function cmdCommands(): Promise<void> {
  const os = new QwenOS();
  await os.initialize();

  const commands = os.commandRouter.list();

  console.log(`\n⌨️  Commands (${commands.length} total):\n`);
  console.log(`${'Command'.padEnd(25)} ${'Category'.padEnd(15)} Description`);
  console.log('─'.repeat(80));

  for (const cmd of commands) {
    const aliases = cmd.aliases.length ? ` [aliases: ${cmd.aliases.join(', ')}]` : '';
    console.log(
      `${cmd.name.padEnd(25)} ${cmd.category.padEnd(15)} ${cmd.description}${aliases}`
    );
  }

  await os.shutdown();
}

async function cmdRun(args: string[]): Promise<void> {
  const agentName = args[0];
  const task = args.slice(1).join(' ');

  if (!agentName || !task) {
    console.log('Usage: qos run <agent-name> <task>');
    console.log('Example: qos run coder "create a REST API for user management"');
    process.exit(1);
  }

  const os = new QwenOS();
  await os.initialize();

  console.log(`🤖 Running ${agentName}: ${task}\n`);
  const result = await os.run(agentName, task);

  if (result.success) {
    console.log(`✅ ${result.output}`);
    console.log(`   Duration: ${result.durationMs}ms`);
  } else {
    console.log(`❌ Error: ${result.error}`);
    process.exit(1);
  }

  await os.shutdown();
}

async function cmdExecute(args: string[]): Promise<void> {
  const commandName = args[0];
  const commandArgs = args.slice(1);

  if (!commandName) {
    console.log('Usage: qos execute <command> [args...]');
    console.log('Example: qos execute plan "build a web app"');
    process.exit(1);
  }

  const os = new QwenOS();
  await os.initialize();

  const parsedArgs: Record<string, unknown> = {};
  for (const arg of commandArgs) {
    const [key, ...rest] = arg.split('=');
    parsedArgs[key.replace(/^--?/, '')] = rest.join('=') || true;
  }

  console.log(`⚡ Executing: ${commandName}`);
  const result = await os.execute(commandName, parsedArgs);

  if (result.success) {
    console.log(`✅ ${result.output}`);
    console.log(`   Duration: ${result.durationMs}ms`);
  } else {
    console.log(`❌ Error: ${result.error}`);
    process.exit(1);
  }

  await os.shutdown();
}

async function cmdSkills(): Promise<void> {
  const os = new QwenOS();
  await os.initialize();

  const skills = os.skillManager.list();

  console.log(`\n📚 Skills (${skills.length} total):\n`);
  console.log(`${'Skill'.padEnd(30)} ${'Category'.padEnd(15)} Description`);
  console.log('─'.repeat(80));

  for (const skill of skills) {
    console.log(
      `${skill.name.padEnd(30)} ${skill.category.padEnd(15)} ${skill.description}`
    );
  }

  await os.shutdown();
}

function printHelp(): void {
  console.log(ASCII_ART);
  console.log('Usage: qos <command> [arguments]\n');
  console.log('Core Commands:');
  console.log('  init [workspace]     Initialize QwenOS workspace');
  console.log('  status               Show system status dashboard');
  console.log('  agents [category]    List all agents (optionally filter by category)');
  console.log('  commands             List all available commands');
  console.log('  skills               List all installed skills');
  console.log('  run <agent> <task>   Run a task through a specific agent');
  console.log('  execute <cmd> [args] Execute a command with arguments');
  console.log('  help                 Show this help message');
  console.log('  --version            Show version');
  console.log('\nCategories:');
  console.log('  core, github, security, swarm, optimization, data, v3');
  console.log('  analysis, automation, sparc, documentation, testing, devops, monitoring, aos');
  console.log('\nExamples:');
  console.log('  qos status');
  console.log('  qos agents core');
  console.log('  qos run coder "create a REST API"');
  console.log('  qos execute plan "build a web app"');
  console.log('  qos run security-reviewer "audit src/ for vulnerabilities"');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
