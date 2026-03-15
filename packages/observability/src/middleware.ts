import { NextFunction, Request, Response } from 'express';

import { createLogger } from '@cloudmatrix/logger';

import { getClient } from './app-insights';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantContext?: { tenantId: string };
    }
  }
}

const logger = createLogger('observability');

export interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  tenantId?: string;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const metrics: RequestMetrics = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      tenantId: req.tenantContext?.tenantId,
    };

    logger.info('HTTP request', metrics as unknown as Record<string, unknown>);

    const client = getClient();
    if (client) {
      client.trackRequest({
        name: `${req.method} ${req.path}`,
        url: req.url,
        duration: durationMs,
        resultCode: String(res.statusCode),
        success: res.statusCode < 400,
        properties: { tenantId: metrics.tenantId ?? 'unknown' },
      });
    }
  });

  next();
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    tenantId: req.tenantContext?.tenantId,
  });

  const client = getClient();
  if (client) {
    client.trackException({ exception: err });
  }

  res.status(500).json({
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
