/**
 * Structured logging utility for AI Exec OS Core
 * Provides contextual logging with trace IDs and structured metadata
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  traceId?: string;
  userId?: string;
  organizationId?: string;
  jobId?: string;
  workflowId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  error?: Error;
  meta?: Record<string, unknown>;
}

class Logger {
  private context: LogContext = {};

  /**
   * Set global context for all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...context };
    return child;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: this.context,
      meta,
      error,
    };

    // In production, this would integrate with a proper logging service
    // (e.g., Winston, Pino, or a cloud logging service)
    const output = {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };

    switch (level) {
      case LogLevel.ERROR:
        console.error(JSON.stringify(output));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(output));
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(JSON.stringify(output));
        }
        break;
      default:
        console.log(JSON.stringify(output));
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, meta, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating child loggers
export { Logger };
