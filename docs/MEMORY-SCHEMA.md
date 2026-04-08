# QwenOS — Memory Schema Specification

## Overview

UnifiedMemory consolidates 3 separate memory systems into a single module with optional HNSW vector search.

```
Before: agentdb (3 instances) → After: UnifiedMemory (1 instance)
```

---

## Memory Entry Schema

```typescript
interface MemoryEntry {
  /** Auto-generated UUID */
  id: string;

  /** Logical grouping (default: 'qwen-os') */
  namespace: string;

  /** Unique key within namespace */
  key: string;

  /** Entry type classification */
  type: string;

  /** Stored data — any JSON-serializable value */
  content: any;

  /** Additional metadata (arbitrary key-value) */
  metadata: Record<string, unknown>;

  /** Creation timestamp */
  createdAt: Date;

  /** Last modification timestamp */
  updatedAt: Date;

  /** Last access timestamp (updated on get/search) */
  accessedAt: Date;

  /** Total access count (incremented on get/search) */
  accessCount: number;

  /** Searchable tags */
  tags: string[];

  /** Origin system: 'agent' | 'command' | 'user' | 'system' */
  source: string;
}
```

---

## API Reference

### store(key, value)
```typescript
async store(key: string, value: {
  content: any;
  type?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  source?: string;
}): Promise<void>
```

Stores a memory entry. Creates new or updates existing.

```typescript
await memory.store('user:preferences', {
  content: { theme: 'dark', language: 'en' },
  type: 'preferences',
  tags: ['user', 'settings'],
  source: 'user',
});
```

### get(key)
```typescript
async get(key: string): Promise<MemoryEntry | null>
```

Retrieves by key. Updates `accessedAt` and increments `accessCount`.

```typescript
const entry = await memory.get('user:preferences');
// Returns MemoryEntry or null
```

### search(query)
```typescript
async search(query: {
  text?: string;
  type?: string;
  tags?: string[];
  namespace?: string;
  limit?: number;
}): Promise<MemoryEntry[]>
```

Searches memory entries. Supports:

- **Full-text search** — scans all entries
- **Type filter** — filter by entry type
- **Tag filter** — filter by tags
- **Namespace filter** — scope to namespace
- **HNSW semantic search** — vector similarity (if enabled)

```typescript
// Full-text search
const results = await memory.search({ text: 'authentication' });

// Type + namespace filter
const prefs = await memory.search({
  type: 'preferences',
  namespace: 'qwen-os',
  limit: 10,
});

// Tag filter
const tagged = await memory.search({ tags: ['user', 'settings'] });
```

### delete(key)
```typescript
async delete(key: string): Promise<boolean>
```

Deletes by key. Returns `true` if deleted, `false` if not found.

### stats()
```typescript
async stats(): Promise<{
  total: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  namespace: string;
}>
```

Returns memory statistics.

```typescript
const stats = await memory.stats();
// {
//   total: 142,
//   byType: { 'task-result': 45, 'preferences': 12, ... },
//   bySource: { 'agent': 89, 'command': 34, 'user': 19 },
//   namespace: 'qwen-os'
// }
```

### clear()
```typescript
async clear(): Promise<void>
```

Debug-only. Wipes all memory entries.

---

## HNSW Vector Search

When `hnswEnabled: true` in config, the search method uses semantic similarity via HNSW (Hierarchical Navigable Small World) vector index.

### Configuration
```typescript
const memory = new UnifiedMemory({
  namespace: 'qwen-os',
  hnswEnabled: true,
  hnsw: {
    efConstruction: 200,  // Build quality (higher = better, slower)
    M: 16,                // Max connections per node
  },
  path: './memory.db',
});
```

### How It Works
1. Content is embedded into vector space (using built-in or external embedding model)
2. HNSW index is built for efficient nearest-neighbor search
3. Search queries are also embedded
4. Results sorted by vector similarity

### Performance
- **Index build**: O(n log n) where n = number of entries
- **Search**: O(log n) — sub-millisecond for 10K+ entries
- **Memory overhead**: ~100 bytes per entry for vectors

---

## Namespaces

Namespaces provide logical isolation:

```
qwen-os:task:123     → QwenOS task results
qwen-os:user:pref    → User preferences
qwen-os:agent:coder  → Agent-specific data
project-x:doc:readme → Project-specific docs
```

### Best Practices
- Use `:` as separator: `namespace:type:identifier`
- Keep namespaces short
- One namespace per project/context
- Default namespace: `qwen-os`

---

## Integration with QwenOS

The QwenOS facade exposes memory through the command context:

```typescript
// Inside any command or agent execution
const ctx = {
  memory: {
    search: (q: string) => memory.search({ text: q }),
    store: async (k: string, v: unknown) => {
      await memory.store(k, { content: String(v) });
    },
  },
};
```

### CLI Access
```bash
qos memory store config.theme dark
qos memory get config.theme
qos memory search "dark theme settings"
qos memory stats
```

---

## Migration from agentdb

```
Before (3 instances):
  agentdb-1: tasks
  agentdb-2: agents
  agentdb-3: config

After (1 instance):
  UnifiedMemory:
    tasks:*    → namespace=task
    agents:*   → namespace=agent
    config:*   → namespace=config
```

Benefits:
- Single AgentDB instance (less memory)
- Unified API surface
- Cross-namespace search
- HNSW vector index (optional)
