# QwenOS — Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        qos CLI                                  │
│                   (Single Entry Point)                          │
│                                                                 │
│   $ qos help | status | agents | commands | skills | run | ...  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │  CommandRouter  │     │  AgentRegistry  │
    │  (25 commands)  │     │  (105 agents)   │
    └────────┬────────┘     └────────┬────────┘
             │                       │
             └───────────┬───────────┘
                         ▼
                 ┌───────────────┐
                 │  SkillManager │
                 │  (31 skills)  │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   QwenOS      │
                 │   (Facade)    │
                 └───────┬───────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ┌──────────┐   ┌────────────┐  ┌──────────────┐
   │EventBus  │   │Unified     │  │MCP           │
   │(CRDT     │   │Memory      │  │Federation    │
   │ pub/sub) │   │(AgentDB+   │  │(load balanced│
   │          │   │ HNSW)      │  │ multi-server)│
   └──────────┘   └────────────┘  └──────────────┘
```

---

## Package Dependencies

```
@qwenos/cli
├── @qwenos/core
│   ├── AgentRegistry → @qwenos/core/agents (105 agents)
│   ├── CommandRouter → @qwenos/core/commands (25 commands)
│   ├── SkillManager → @qwenos/core/skills (31 skills)
│   ├── HookManager → @qwenos/core/hooks (pre/post/session)
│   └── QwenOS (Facade)
│       ├── depends on all above
│       ├── lazy-loads memory, event-bus, mcp-federation
│       └── provides unified execute(), run(), status()
├── @qwenos/event-bus
│   ├── CRDT-based pub/sub
│   ├── Local transport (single-process)
│   └── Event types: qwenos:*, agent:*, memory:*, task:*
├── @qwenos/memory
│   ├── UnifiedMemory (AgentDB + HNSW)
│   ├── Namespaced keys: namespace:key
│   └── Semantic search via HNSW vector index
└── @qwenos/mcp-federation
    ├── Multi-server MCP tool routing
    ├── Load balancing (least-loaded)
    └── Health checking + failover
```

---

## Data Flow

### Command Execution Path
```
user input → qos CLI → CommandRouter.parse()
                     → HookManager.preTask() [blocking]
                     → CommandRouter.execute()
                     → Command result
                     → HookManager.postTask() [fire-and-forget]
                     → Response to user
```

### Agent Execution Path
```
qos run <agent> "<task>" → AgentRegistry.get(agent)
                         → agent.execute(task, context)
                         → AgentResult { success, output, error }
                         → Response to user
```

### Memory Access Path
```
command/agent → ctx.memory.store(key, value)
              → UnifiedMemory.store()
              → HNSW index update (if enabled)
              → Return

query → ctx.memory.search(text)
      → UnifiedMemory.search()
      → HNSW semantic search
      → Return results
```

---

## Agent Categories (105 total)

| Category | Count | Examples |
|----------|-------|----------|
| core | 10 | coder, planner, researcher, reviewer, tester |
| security | 5 | security-reviewer, pentester, vuln-scanner |
| github | 5 | pr-manager, code-reviewer, issue-manager |
| analysis | 5 | code-analyzer, bottleneck-detector |
| automation | 5 | self-healer, smart-dispatcher, commit-helper |
| testing | 5 | tdd-agent, e2e-tester, unit-tester |
| documentation | 5 | api-docs, readme-generator, changelog-agent |
| devops | 5 | ci-configurer, docker-builder, deploy-agent |
| monitoring | 5 | metrics-agent, alert-agent, log-analyzer |
| swarm | 5 | swarm-coordinator, consensus-agent, load-balancer |
| sparc | 5 | scope-agent, plan-agent, act-agent |
| v3 | 10 | ddd-agent, adr-agent, circuit-breaker |
| aos | 10 | aos-runtime, aos-scheduler, aos-security |
| optimization | 5 | perf-analyzer, memory-optimizer |
| data | 5 | ml-pipeline, data-validator, etl-agent |

---

## Command Categories (25 total)

| Category | Commands |
|----------|----------|
| system | help, status, agents, commands, skills, version, doctor, config |
| execution | run, execute, workflow, sparc-spec |
| memory | memory (store, get, search, delete, stats) |
| swarm | swarm, spawn |
| analysis | analyze, security-scan |
| testing | test |
| devops | build, deploy |
| monitoring | logs, metrics |
| automation | heal |
| system events | events, mcp |

---

## Memory Schema

```
Memory Entry {
  id: string          // Auto-generated UUID
  namespace: string   // Logical grouping (default: 'qwen-os')
  key: string         // Unique within namespace
  type: string        // Entry type classification
  content: any        // Stored data (string, object, array)
  metadata: object    // Additional metadata
  createdAt: Date     // Creation timestamp
  updatedAt: Date     // Last modification timestamp
  accessedAt: Date    // Last access timestamp
  accessCount: number // Total access count
  tags: string[]      // Searchable tags
  source: string      // Origin system (agent, command, user)
}
```

---

## Event Types

```
qwenos:initializing    — System starting up
qwenos:initialized     — System ready (payload: agents, commands, skills count)
qwenos:shutdown        — System shutting down
agent:start            — Agent beginning task
agent:complete         — Agent finished task
memory:init            — Memory subsystem ready
eventbus:init          — Event bus ready
mcp:init               — MCP federation ready
pre-task               — Before command execution (blocking)
post-task              — After command execution (non-blocking)
task-error             — Command execution failed
```

---

## Deployment

```
Development:
  qos CLI → Local process
  Memory: In-process UnifiedMemory
  Events: Local transport
  MCP: Direct connections

Production (future):
  qos CLI → gRPC server
  Memory: Redis-backed AgentDB
  Events: Distributed CRDT pub/sub
  MCP: Load-balanced federation
```
