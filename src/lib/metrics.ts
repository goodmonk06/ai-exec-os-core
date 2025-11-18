/**
 * Metrics collection utility for AI Exec OS Core
 * Provides a pluggable interface for collecting application metrics
 */

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

export interface MetricLabels {
  [key: string]: string | number;
}

export interface MetricEntry {
  name: string;
  type: MetricType;
  value: number;
  labels?: MetricLabels;
  timestamp: Date;
}

export interface IMetricsAdapter {
  record(entry: MetricEntry): void | Promise<void>;
  flush?(): void | Promise<void>;
}

/**
 * In-memory metrics adapter (default, for development)
 */
class InMemoryMetricsAdapter implements IMetricsAdapter {
  private metrics: MetricEntry[] = [];

  record(entry: MetricEntry): void {
    this.metrics.push(entry);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // In development, log metrics
    if (process.env.NODE_ENV === 'development') {
      console.log('[Metrics]', JSON.stringify(entry));
    }
  }

  getMetrics(): MetricEntry[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}

class MetricsCollector {
  private adapter: IMetricsAdapter;

  constructor(adapter?: IMetricsAdapter) {
    this.adapter = adapter || new InMemoryMetricsAdapter();
  }

  /**
   * Set a custom metrics adapter (e.g., Prometheus, DataDog)
   */
  setAdapter(adapter: IMetricsAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1, labels?: MetricLabels): void {
    this.adapter.record({
      name,
      type: MetricType.COUNTER,
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Set a gauge metric (absolute value)
   */
  setGauge(name: string, value: number, labels?: MetricLabels): void {
    this.adapter.record({
      name,
      type: MetricType.GAUGE,
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Record a histogram value (for latency, sizes, etc.)
   */
  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    this.adapter.record({
      name,
      type: MetricType.HISTOGRAM,
      value,
      labels,
      timestamp: new Date(),
    });
  }

  /**
   * Helper: Record operation duration
   */
  async measureDuration<T>(
    name: string,
    operation: () => Promise<T>,
    labels?: MetricLabels
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      this.recordHistogram(`${name}_duration_ms`, duration, labels);
      this.incrementCounter(`${name}_total`, 1, { ...labels, status: 'success' });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordHistogram(`${name}_duration_ms`, duration, labels);
      this.incrementCounter(`${name}_total`, 1, { ...labels, status: 'error' });
      throw error;
    }
  }

  /**
   * Flush metrics (if adapter supports it)
   */
  async flush(): Promise<void> {
    if (this.adapter.flush) {
      await this.adapter.flush();
    }
  }
}

// Export singleton instance
export const metrics = new MetricsCollector();

// Export types and class
export { MetricsCollector, InMemoryMetricsAdapter };
