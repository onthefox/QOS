# 🤖 QwenOS - Unified Agent Operating System

> One system to orchestrate them all — deduplicated, simplified, OOP-designed.

## What Is This

QwenOS unifies **4 separate systems** from USB archives into a single, clean OOP architecture:

| Source | Original | What It Contributed |
|--------|----------|---------------------|
| **qwen-only** | 18 MB | 99 agents, 80+ commands, 31 skills, hooks |
| **black-bridges** | 173 MB | Event bus, MCP federation, shared memory |
| **shannon-only** | 237 MB | Security agents, audit logging, Temporal workflows |
| **AOS** | 11 MB | Agent OS design (Lua), IDE-style CLI concept |

## The Problem We Solved

### Before: 4 separate systems, duplicated everywhere
- 🔴 **18K+ files** (95% duplicated node_modules)
- 🔴 **80+ commands** with overlapping functionality
- 🔴 **3 separate AgentDB instances** (wasted memory)
- 🔴 **4 sets of hooks** (pre/post/session conflicting)
- 🔴 **4 CLI entry points** (no single source of truth)
- 🔴 **MCP servers in 3 places** (no federation)

### After: 1 unified system
- ✅ **~30 source files** (clean, typed, documented)
- ✅ **25 deduplicated commands** with alias resolution
- ✅ **1 shared AgentDB + HNSW** instance
- ✅ **1 merged hook dispatcher**
- ✅ **1 `qos` CLI** entry point
- ✅ **1 MCP federation** layer

## Architecture

```
                    qos CLI (single entry point)
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        CommandRouter  AgentRegistry  SkillManager
         (80→25 cmds)  (105 agents)   (31 skills)
              │            │            │
              └────────────┼────────────┘
                           ▼
                    ┌─────────────┐
                    │   QwenOS    │
                    │   (Facade)  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
      @qwenos/      @qwenos/        @qwenos/
      event-bus      memory         mcp-federation
   (pub/sub CRDT)  (AgentDB+HNSW)  (load balanced)
```

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USER/qwen-os.git
cd qwen-os

# Install (hoisted monorepo - one node_modules)
bun install

# Build
bun run build

# Run CLI
bun run start help

# Or use the qos alias
bun run qos status
```

## CLI Usage

```bash
qos help                     # Show all commands
qos status                   # System status dashboard
qos agents                   # List all 105 agents
qos agents core              # Filter by category
qos commands                 # List all 25 deduped commands
qos skills                   # List all 31 skills

qos run coder "create REST API"          # Run an agent
qos run security-reviewer "audit src/"   # Security audit

qos execute plan "build web app"         # Execute a command
qos execute sparc-spec                   # SPARC specification
```

## Monorepo Structure

```
qwen-os/
├── packages/
│   ├── core/              # QwenOS facade, AgentRegistry, CommandRouter
│   ├── event-bus/         # CRDT-based pub/sub (from black-bridges)
│   ├── memory/            # Unified AgentDB + HNSW
│   └── mcp-federation/    # Load-balanced MCP tool access
├── apps/
│   └── cli/               # qos CLI entry point
├── docs/                  # Architecture documentation
└── package.json           # Workspace root (hoisted deps)
```

## De-duplication Summary

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Files | 18,000+ | ~30 | 99.8% |
| Commands | 80+ | 25 | 68% |
| Agent registries | 3 | 1 | 66% |
| Memory instances | 3 | 1 | 66% |
| Hook sets | 4 | 1 | 75% |
| CLI entry points | 4 | 1 | 75% |
| MCP layers | 3 | 1 | 66% |

## Design Principles

1. **Single Responsibility** — Each package does one thing
2. **Single Source** — No duplicate registries or configs
3. **OOP Facade** — `QwenOS` class hides all complexity
4. **Workspace Hoisting** — Dependencies installed once at root
5. **Alias Resolution** — Old command names still work
6. **Type Safety** — Full TypeScript, strict mode

## License

MIT
