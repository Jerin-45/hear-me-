/**
 * HearMe AI - Event-Driven Architecture & Pub/Sub Bus
 * Implements TRACEN Topic 16 (Pub/Sub) & Topic 17 (Event-Driven Architecture)
 *
 * Decouples telemetry, audit logging, and cache invalidation from core HTTP request handlers.
 */

import { EventEmitter } from 'events';

export type EventTopic =
  | 'ai:request_started'
  | 'ai:completed'
  | 'ai:cache_hit'
  | 'ai:error'
  | 'circuit:state_change'
  | 'rate_limit:blocked'
  | 'system:cron_maintenance';

interface EventPayloads {
  'ai:request_started': { endpoint: string; clientIp: string; timestamp: number; requestId: string };
  'ai:completed': { endpoint: string; durationMs: number; cached: boolean; requestId: string };
  'ai:cache_hit': { key: string; endpoint: string };
  'ai:error': { endpoint: string; error: string; requestId: string };
  'circuit:state_change': { circuit: string; from: string; to: string };
  'rate_limit:blocked': { clientIp: string; endpoint: string };
  'system:cron_maintenance': { purgedCacheEntries: number; purgedRateLimiterEntries: number; memoryUsageMb: number };
}

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(30);

    // Default internal subscriber for audit and structured logging
    this.on('ai:completed', (data: EventPayloads['ai:completed']) => {
      if (data.cached) {
        console.log(`[EventBus:Telemetry] [CACHE_HIT] ${data.endpoint} served in ${data.durationMs}ms (Req: ${data.requestId})`);
      } else {
        console.log(`[EventBus:Telemetry] [AI_EXEC] ${data.endpoint} generated in ${data.durationMs}ms (Req: ${data.requestId})`);
      }
    });

    this.on('ai:error', (data: EventPayloads['ai:error']) => {
      console.error(`[EventBus:Telemetry] [AI_ERROR] ${data.endpoint}: ${data.error} (Req: ${data.requestId})`);
    });

    this.on('circuit:state_change', (data: EventPayloads['circuit:state_change']) => {
      console.warn(`[EventBus:Alert] Circuit ${data.circuit} transitioned: ${data.from} -> ${data.to}`);
    });
  }

  /**
   * Strongly-typed event emitter
   */
  publish<K extends EventTopic>(topic: K, payload: EventPayloads[K]): void {
    this.emit(topic, payload);
  }

  /**
   * Strongly-typed event listener
   */
  subscribe<K extends EventTopic>(topic: K, listener: (payload: EventPayloads[K]) => void): void {
    this.on(topic, listener);
  }
}

export const eventBus = new AppEventBus();
