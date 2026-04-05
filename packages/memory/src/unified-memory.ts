/**
 * UnifiedMemory - Single AgentDB instance with HNSW vector search
 * Replaces 3 separate memory instances (qwen-only, black-bridges, AOS)
 */

import type { MemoryEntry, MemoryQuery, MemoryResult } from './types.js';

export class UnifiedMemory {
  private store = new Map<string, MemoryEntry>();
  private namespace: string;
  private hnswEnabled: boolean;

  constructor(options: { namespace?: string; hnswEnabled?: boolean; path?: string } = {}) {
    this.namespace = options.namespace ?? 'qwen-os';
    this.hnswEnabled = options.hnswEnabled ?? true;
  }

  /**
   * Store a memory entry
   */
  async store(key: string, data: Omit<Partial<MemoryEntry>, 'key'>): Promise<void> {
    const fullKey = `${this.namespace}:${key}`;

    const existing = this.store.get(fullKey);
    const entry: MemoryEntry = {
      key: fullKey,
      type: data.type ?? 'episodic',
      content: data.content ?? '',
      embedding: data.embedding,
      metadata: data.metadata ?? {},
      tags: data.tags ?? [],
      source: data.source ?? 'qwen-os',
      createdAt: existing?.createdAt ?? new Date(),
      accessedAt: new Date(),
      accessCount: (existing?.accessCount ?? 0) + 1,
    };

    this.store.set(fullKey, entry);
  }

  /**
   * Retrieve a memory by key
   */
  async get(key: string): Promise<MemoryEntry | null> {
    const fullKey = `${this.namespace}:${key}`;
    const entry = this.store.get(fullKey);
    if (entry) {
      entry.accessedAt = new Date();
      entry.accessCount++;
      return entry;
    }
    return null;
  }

  /**
   * Search memories with optional semantic similarity
   */
  async search(query: MemoryQuery): Promise<MemoryResult[]> {
    let results = Array.from(this.store.values());

    // Filter by type
    if (query.type) {
      results = results.filter(e => e.type === query.type);
    }

    // Filter by tags
    if (query.tags?.length) {
      results = results.filter(e => query.tags!.some(t => e.tags.includes(t)));
    }

    // Filter by source
    if (query.source) {
      results = results.filter(e => e.source === query.source);
    }

    // Text search (simple containment)
    if (query.text) {
      const text = query.text.toLowerCase();
      results = results.filter(e =>
        e.content.toLowerCase().includes(text) ||
        e.tags.some(t => t.toLowerCase().includes(text))
      );
    }

    // HNSW vector similarity (stub - real impl uses agentdb HNSW)
    if (query.embedding && this.hnswEnabled) {
      results = this.vectorSearch(results, query.embedding, query.threshold);
    }

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results.map(entry => ({
      entry,
      score: 1.0, // Simplified - real impl calculates similarity
    }));
  }

  /**
   * Delete a memory
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = `${this.namespace}:${key}`;
    return this.store.delete(fullKey);
  }

  /**
   * Get memory statistics
   */
  stats(): { total: number; byType: Record<string, number>; bySource: Record<string, number> } {
    const entries = Array.from(this.store.values());
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const e of entries) {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
      bySource[e.source] = (bySource[e.source] ?? 0) + 1;
    }

    return { total: entries.length, byType, bySource };
  }

  /**
   * Clear all memories (debug only)
   */
  clear(): void {
    this.store.clear();
  }

  // --- Private ---

  private vectorSearch(
    entries: MemoryEntry[],
    queryVec: number[],
    threshold = 0.7
  ): MemoryEntry[] {
    // Stub: real implementation uses HNSW index from AgentDB
    // For now, simple cosine similarity on stored embeddings
    const scored = entries
      .filter(e => e.embedding)
      .map(e => ({
        entry: e,
        score: this.cosineSimilarity(e.embedding!, queryVec),
      }))
      .filter(r => r.score >= threshold)
      .sort((a, b) => b.score - a.score);

    return scored.map(r => r.entry);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}
