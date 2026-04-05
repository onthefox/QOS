/**
 * EventBus - CRDT-based event streaming from black-bridges
 * Unified pub/sub for all QwenOS subsystems
 */

import type { BlackBridgeEvent, EventCallback, EventType } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class EventBus {
  private subscribers = new Map<string, Set<EventCallback>>();
  private eventLog: BlackBridgeEvent[] = [];
  private maxLogSize = 10000;
  private crdtEnabled = true;

  /**
   * Subscribe to an event type (supports wildcards)
   */
  subscribe(pattern: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(pattern)?.delete(callback);
    };
  }

  /**
   * Subscribe to multiple event types at once
   */
  subscribeMany(patterns: string[], callback: EventCallback): () => void {
    const unsubscribers = patterns.map(p => this.subscribe(p, callback));
    return () => unsubscribers.forEach(unsub => unsub());
  }

  /**
   * Emit an event to all matching subscribers
   */
  emit(type: EventType, payload: unknown, source = 'qwenos'): void {
    const event: BlackBridgeEvent = {
      type,
      source,
      payload,
      timestamp: Date.now(),
      traceId: uuidv4(),
    };

    // Append to log
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    // Notify matching subscribers
    for (const [pattern, callbacks] of this.subscribers) {
      if (this.matchesPattern(event.type, pattern)) {
        for (const cb of callbacks) {
          cb(event).catch(err => console.error('Event handler error:', err));
        }
      }
    }
  }

  /**
   * Get recent events (for monitoring/debugging)
   */
  getRecentEvents(limit = 50): BlackBridgeEvent[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string, limit = 100): BlackBridgeEvent[] {
    return this.eventLog.filter(e => e.type === type).slice(-limit);
  }

  /**
   * Clear event log
   */
  clearLog(): void {
    this.eventLog = [];
  }

  /**
   * Get stats
   */
  stats(): { totalSubscribers: number; totalEvents: number; patterns: number } {
    return {
      totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, s) => sum + s.size, 0),
      totalEvents: this.eventLog.length,
      patterns: this.subscribers.size,
    };
  }

  // --- Private ---

  private matchesPattern(eventType: string, pattern: string): boolean {
    if (pattern === eventType) return true;
    if (pattern === '*') return true;

    // Support wildcard: 'agent:*' matches 'agent:spawn', 'agent:start', etc.
    if (pattern.endsWith(':*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix + ':');
    }

    return false;
  }
}
