# QwenOS — CLI Command Map

## Overview

25 commands deduplicated from 80+ legacy commands. All accessible through `qos` CLI.

```
$ qos help
$ qos <command> [args]
```

---

## System Commands (8)

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `help` | h, ? | Show all commands | `qos help` |
| `status` | st, dashboard | System dashboard | `qos status` |
| `agents` | a, list-agents | List agents (filter by category) | `qos agents core` |
| `commands` | cmds, list-commands | List all commands | `qos commands` |
| `skills` | list-skills | List all skills | `qos skills` |
| `version` | v, --version | Show version | `qos version` |
| `doctor` | — | Run diagnostics | `qos doctor` |
| `config` | cfg | View configuration | `qos config` |

---

## Execution Commands (4)

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `run` | spawn | Run agent with task | `qos run coder "build API"` |
| `execute` | exec, x | Execute command | `qos execute plan "design"` |
| `workflow` | wf | Manage workflows | `qos workflow list` |
| `sparc-spec` | sparc | Generate SPARC spec | `qos sparc-spec` |

---

## Memory Commands (1)

| Command | Aliases | Subcommands | Example |
|---------|---------|-------------|---------|
| `memory` | mem | store, get, search, delete, stats | `qos memory store key value` |

### Memory Subcommands

```bash
qos memory store <key> <value>    # Store a value
qos memory get <key>              # Retrieve by key
qos memory search <query>         # Semantic search
qos memory delete <key>           # Delete by key
qos memory stats                  # Show statistics
```

---

## Swarm Commands (2)

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `swarm` | swarm-coord | Swarm coordination | `qos swarm status` |
| `spawn` | — | Spawn agent instance | `qos spawn planner` |

---

## Analysis Commands (2)

| Command | Aliases | Description | Example |
|---------|---------|-------------|---------|
| `analyze` | audit | Code analysis | `qos analyze src/` |
| `security-scan` | sec-scan | Security scan | `qos security-scan .` |

---

## Other Commands (8)

| Command | Aliases | Category | Description |
|---------|---------|----------|-------------|
| `test` | run-tests | Testing | Run test suite |
| `build` | — | DevOps | Build packages |
| `deploy` | — | DevOps | Deploy to environment |
| `logs` | log | Monitoring | View system logs |
| `metrics` | — | Monitoring | Performance dashboard |
| `heal` | self-heal | Automation | Trigger self-healing |
| `events` | event-bus | System | Event bus management |
| `mcp` | mcp-servers | System | MCP federation status |

---

## Command Resolution Order

1. **Exact match** — `qos help` → finds `help`
2. **Alias match** — `qos h` → finds `help` (alias: h)
3. **Prefix match** — `qos hel` → finds `help`
4. **Error** — Unknown command

---

## Adding a Command

```typescript
// packages/core/src/commands/index.ts
{
  name: 'my-cmd',
  description: 'My command description',
  category: 'system',
  aliases: ['mc'],
  async execute(args: Record<string, unknown>, ctx: CommandContext) {
    return {
      success: true,
      output: 'Result',
      durationMs: 0,
    };
  },
}
```

Categories: `system`, `execution`, `memory`, `swarm`, `analysis`, `testing`, `devops`, `monitoring`, `automation`, `security`, `documentation`
