/**
 * Domain event system for AI Exec OS Core
 * Enables extensible event-driven architecture
 */

export enum EventType {
  // Job events
  JOB_CREATED = 'job.created',
  JOB_STARTED = 'job.started',
  JOB_COMPLETED = 'job.completed',
  JOB_FAILED = 'job.failed',
  JOB_CANCELLED = 'job.cancelled',

  // Workflow events
  WORKFLOW_CREATED = 'workflow.created',
  WORKFLOW_UPDATED = 'workflow.updated',
  WORKFLOW_DELETED = 'workflow.deleted',
  WORKFLOW_VERSION_CREATED = 'workflow.version.created',

  // Agent events
  AGENT_CREATED = 'agent.created',
  AGENT_UPDATED = 'agent.updated',
  AGENT_DELETED = 'agent.deleted',

  // Schedule events
  SCHEDULE_CREATED = 'schedule.created',
  SCHEDULE_TRIGGERED = 'schedule.triggered',
  SCHEDULE_FAILED = 'schedule.failed',

  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_HEALTH_CHECK = 'system.health_check',
}

export interface DomainEvent<T = unknown> {
  id: string;
  type: EventType;
  timestamp: Date;
  data: T;
  metadata?: Record<string, unknown>;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

class EventEmitter {
  private handlers: Map<EventType, EventHandler[]> = new Map();

  /**
   * Subscribe to an event type
   */
  on(eventType: EventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  /**
   * Subscribe to an event type (one-time)
   */
  once(eventType: EventType, handler: EventHandler): void {
    const wrappedHandler: EventHandler = async (event) => {
      await handler(event);
      this.off(eventType, wrappedHandler);
    };
    this.on(eventType, wrappedHandler);
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: EventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(
      eventType,
      existing.filter((h) => h !== handler)
    );
  }

  /**
   * Emit an event
   */
  async emit<T>(eventType: EventType, data: T, metadata?: Record<string, unknown>): Promise<void> {
    const event: DomainEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: new Date(),
      data,
      metadata,
    };

    const handlers = this.handlers.get(eventType) || [];

    // Execute all handlers (async, non-blocking)
    await Promise.allSettled(
      handlers.map((handler) =>
        Promise.resolve(handler(event)).catch((error) => {
          console.error(`Error in event handler for ${eventType}:`, error);
        })
      )
    );
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): EventType[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: EventType): number {
    return (this.handlers.get(eventType) || []).length;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Export singleton instance
export const events = new EventEmitter();

// Export class for testing
export { EventEmitter };
