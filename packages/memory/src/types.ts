export interface MemoryEntry {
  key: string;
  type: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  tags: string[];
  source: string;
  createdAt: Date;
  accessedAt?: Date;
  accessCount: number;
}

export interface MemoryQuery {
  text?: string;
  embedding?: number[];
  type?: string;
  tags?: string[];
  source?: string;
  limit?: number;
  threshold?: number;
}

export interface MemoryResult {
  entry: MemoryEntry;
  score: number;
}
