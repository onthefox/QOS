/**
 * Memory types - unified AgentDB + HNSW from black-bridges + qwen-only
 */

export type MemoryType = 'episodic' | 'semantic' | 'procedural' | 'pattern' | 'security-pattern';

export interface MemoryEntry {
  /** Unique key */
  key: string;
  /** Entry type */
  type: MemoryType;
  /** Content data */
  content: string;
  /** Embedding vector (for HNSW search) */
  embedding?: number[];
  /** Metadata */
  metadata: Record<string, unknown>;
  /** Tags for filtering */
  tags: string[];
  /** Source system */
  source: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last access timestamp */
  accessedAt?: Date;
  /** Access count */
  accessCount: number;
}

export interface MemoryQuery {
  /** Text search query */
  text?: string;
  /** Embedding vector for similarity search */
  embedding?: number[];
  /** Filter by type */
  type?: MemoryType;
  /** Filter by tags */
  tags?: string[];
  /** Filter by source */
  source?: string;
  /** Maximum results */
  limit?: number;
  /** Minimum similarity threshold (0-1) */
  threshold?: number;
}

export interface MemoryResult {
  entry: MemoryEntry;
  /** Similarity score (0-1) */
  score: number;
}
