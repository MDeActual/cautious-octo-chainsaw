export interface MetricEvent {
  name: string;
  value: number;
  unit?: string;
  dimensions?: Record<string, string>;
  timestamp: string;
}

export interface TraceSpan {
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
  name: string;
  service: string;
  start_time: string;
  end_time?: string;
  status: 'ok' | 'error';
  attributes?: Record<string, unknown>;
}

export interface ObservabilityConfig {
  service: string;
  connectionString?: string;
  enabled: boolean;
}

/**
 * Minimal observability client. In production, wire up to Application Insights
 * via the App Insights SDK using the connectionString from config.
 */
export class ObservabilityClient {
  private readonly config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  trackMetric(event: Omit<MetricEvent, 'timestamp'>): void {
    if (!this.config.enabled) return;
    const entry: MetricEvent = { ...event, timestamp: new Date().toISOString() };
    // TODO: forward to Application Insights when connectionString is set
    process.stdout.write(JSON.stringify({ type: 'metric', ...entry }) + '\n');
  }

  trackTrace(span: Omit<TraceSpan, 'service'>): void {
    if (!this.config.enabled) return;
    const entry: TraceSpan = { ...span, service: this.config.service };
    process.stdout.write(JSON.stringify({ type: 'trace', ...entry }) + '\n');
  }

  trackException(error: Error, properties?: Record<string, string>): void {
    if (!this.config.enabled) return;
    process.stderr.write(
      JSON.stringify({
        type: 'exception',
        service: this.config.service,
        message: error.message,
        stack: error.stack,
        properties,
        timestamp: new Date().toISOString(),
      }) + '\n',
    );
  }
}

export function createObservabilityClient(config: ObservabilityConfig): ObservabilityClient {
  return new ObservabilityClient(config);
}
