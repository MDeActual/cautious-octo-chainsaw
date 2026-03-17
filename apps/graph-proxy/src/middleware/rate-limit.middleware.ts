import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Creates a per-tenant rate limiter middleware.
 * Defaults: 100 requests per 60 seconds per tenant.
 * Configurable via RATE_LIMIT_WINDOW_MS and RATE_LIMIT_PER_TENANT env vars.
 */
export function createTenantRateLimiter() {
  return rateLimit({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_PER_TENANT'] ?? '100', 10),
    keyGenerator: (req: Request): string => {
      const tenantId = req.params['tenantId'];
      return tenantId ?? req.ip ?? 'unknown';
    },
    message: { data: null, error: 'Too many requests from this tenant, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}
