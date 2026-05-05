import { v4 as uuidv4 } from 'uuid';
import type { UsageRecord, UsageStats } from '@cloudmatrix/shared-types';

/**
 * Tracks AI token usage in memory for Phase 1.
 * In production, this would persist to the ai_usage_logs table.
 */
export class UsageService {
  private readonly records: UsageRecord[] = [];

  /**
   * Records a single AI operation usage entry.
   */
  record(entry: Omit<UsageRecord, 'id' | 'created_at'>): UsageRecord {
    const record: UsageRecord = {
      ...entry,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  /**
   * Returns aggregated usage statistics.
   */
  getStats(): UsageStats {
    const byOperation: UsageStats['by_operation'] = {};

    for (const record of this.records) {
      const op = record.operation;
      if (!byOperation[op]) {
        byOperation[op] = { requests: 0, tokens: 0, cost_usd: 0 };
      }
      byOperation[op]!.requests += 1;
      byOperation[op]!.tokens += record.tokens_used;
      byOperation[op]!.cost_usd += record.cost_usd;
    }

    return {
      total_requests: this.records.length,
      total_tokens: this.records.reduce((sum, r) => sum + r.tokens_used, 0),
      total_cost_usd: this.records.reduce((sum, r) => sum + r.cost_usd, 0),
      by_operation: byOperation,
    };
  }

  /**
   * Returns the raw usage records (last N entries).
   */
  getRecords(limit = 100): UsageRecord[] {
    return this.records.slice(-limit);
  }

  /**
   * Returns usage records for a specific tenant, most recent first.
   * Enables the AI transparency panel to show per-tenant AI usage history.
   */
  getRecordsByTenant(tenantId: string, limit = 50): UsageRecord[] {
    return this.records
      .filter((r) => r.tenant_id === tenantId)
      .slice(-limit)
      .reverse();
  }
}

// Singleton instance for the process lifetime
export const usageService = new UsageService();
