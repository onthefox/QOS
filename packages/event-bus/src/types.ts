/**
 * Event types for the unified event bus
 * Merged from black-bridges + qwen-only event definitions
 */

export type EventType =
  // Agent lifecycle
  | 'agent:spawn'
  | 'agent:start'
  | 'agent:complete'
  | 'agent:fail'
  | 'agent:dispose'
  // Memory events
  | 'memory:store'
  | 'memory:search'
  | 'memory:learn'
  // Command events
  | 'command:execute'
  | 'command:complete'
  | 'command:error'
  // Swarm events
  | 'swarm:create'
  | 'swarm:coordinate'
  | 'swarm:resolve'
  // Security events
  | 'vuln:found'
  | 'pattern:learned'
  | 'skill:learned'
  // System events
  | 'qwenos:initializing'
  | 'qwenos:initialized'
  | 'qwenos:shutdown'
  | 'hook:error'
  | 'session:start'
  | 'session:end';

export interface BlackBridgeEvent {
  type: EventType;
  source: string;
  payload: unknown;
  timestamp: number;
  traceId: string;
}

export type EventCallback = (event: BlackBridgeEvent) => void | Promise<void>;
