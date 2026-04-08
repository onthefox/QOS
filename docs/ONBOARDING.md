# QwenOS — Developer Onboarding Cheat Sheet

## 🚀 Quick Start (30 seconds)

```bash
git clone https://github.com/onthefox/QOS.git && cd QOS
bun install && bun run build
bun run start help
```

---

## 📦 Monorepo Structure

```
QOS/
├── apps/cli/                 # qos CLI entry point
│   └── src/cli.ts           # Parses argv, calls QwenOS.execute()
├── packages/
│   ├── core/                # Main application logic
│   │   ├── qwen-os.ts       # Facade class (unified entry)
│   │   ├── agent-registry.ts # 105 agents
│   │   ├── command-router.ts # 25 commands
│   │   ├── skill-manager.ts  # 31 skills
│   │   ├── hook-manager.ts   # Pre/post hooks
│   │   ├── agents/index.ts   # Agent implementations
│   │   └── commands/index.ts # Command implementations
│   ├── memory/              # UnifiedMemory (AgentDB + HNSW)
│   ├── event-bus/           # CRDT pub/sub
│   └── mcp-federation/      # MCP tool routing
└── docs/                    # This documentation
```

---

## 🎯 CLI Reference

### System
```bash
qos help              # Show all commands
qos status            # System dashboard
qos version           # v1.0.0
qos doctor            # Diagnostic checks
qos config            # View configuration
```

### List
```bash
qos agents            # All 105 agents
qos agents core       # Filter by category
qos commands          # All 25 commands
qos skills            # All 31 skills
```

### Execute
```bash
qos run coder "implement binary search"
qos run security-reviewer "audit src/"
qos execute plan "build web app"
qos spawn planner     # Spawn agent instance
```

### Memory
```bash
qos memory store mykey myvalue
qos memory get mykey
qos memory search "related to auth"
qos memory stats
qos memory delete mykey
```

### DevOps
```bash
qos build             # Build all packages
qos deploy production # Deploy
qos test              # Run tests
qos logs              # View logs
qos metrics           # Performance dashboard
```

### Automation
```bash
qos heal              # Self-healing cycle
qos analyze src/      # Code analysis
qos security-scan .   # Security scan
qos sparc-spec        # Generate SPARC spec
```

---

## 🤖 Agent Categories

| Category | Count | Key Agents |
|----------|-------|------------|
| core | 10 | coder, planner, architect, reviewer |
| security | 5 | security-reviewer, pentester |
| github | 5 | pr-manager, code-reviewer |
| analysis | 5 | code-analyzer, bottleneck-detector |
| automation | 5 | self-healer, smart-dispatcher |
| testing | 5 | tdd-agent, e2e-tester |
| documentation | 5 | api-docs, readme-generator |
| devops | 5 | ci-configurer, docker-builder |
| monitoring | 5 | metrics-agent, alert-agent |
| swarm | 5 | swarm-coordinator, consensus-agent |
| sparc | 5 | scope-agent, plan-agent, act-agent |
| v3 | 10 | ddd-agent, circuit-breaker, saga-agent |
| aos | 10 | aos-runtime, aos-scheduler |
| optimization | 5 | perf-analyzer, bundle-optimizer |
| data | 5 | ml-pipeline, etl-agent |

---

## 🔌 Adding a New Agent

```typescript
// packages/core/src/agents/index.ts
createAgent({
  id: 'my-agent',
  name: 'My Agent',
  category: 'core',
  description: 'Does something useful',
  maxInstances: 3,
  tags: ['custom', 'useful'],
  priority: 7,
}, async (task) => ({
  success: true,
  output: `Result: ${task}`,
  durationMs: 0,
}));
```

---

## 🔌 Adding a New Command

```typescript
// packages/core/src/commands/index.ts
{
  name: 'my-command',
  description: 'Does something useful',
  category: 'system',
  aliases: ['mc'],
  async execute(args, ctx) {
    return {
      success: true,
      output: `Result: ${args}`,
      durationMs: 0,
    };
  },
}
```

---

## 🧠 Memory API

```typescript
// Available through ctx.memory in commands/agents
await memory.store('key', { content: 'value', type: 'string' });
const entry = await memory.get('key');
const results = await memory.search('query text');
const stats = await memory.stats();
await memory.delete('key');
```

---

## 📐 Key Numbers

| Metric | Value |
|--------|-------|
| Total agents | 105 |
| Total commands | 25 (deduped from 80+) |
| Total skills | 31 |
| Packages | 6 |
| Source files | ~30 |
| TypeScript | Strict mode |
| Bundle | None (native ESM) |

---

## 🛠️ Common Tasks

### Run a specific agent
```bash
qos run coder "create REST API with FastAPI"
```

### Filter agents by category
```bash
qos agents security
```

### Check system health
```bash
qos doctor
```

### View metrics
```bash
qos metrics
```

### Trigger self-healing
```bash
qos heal
```

---

## 📚 Further Reading

- [Architecture](./ARCHITECTURE.md) — Full system diagram
- [CLI Commands](./CLI-COMMANDS.md) — Complete command reference
- [Memory Schema](./MEMORY-SCHEMA.md) — Data model specification
- [Onboarding](./ONBOARDING.md) — This document
