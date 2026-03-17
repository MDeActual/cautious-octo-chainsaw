import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import type { AutomationEvent } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';

export const eventsRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'automation-service' });

const AutomationEventSchema = z.object({
  event_type: z.string().min(1),
  tenant_id: z.string().uuid(),
  payload: z.record(z.unknown()),
});

/**
 * POST /events — receive and process an automation event from core-backend
 * Phase 1: Logs the event; Phase 2 will trigger Teams/Email/Planner.
 */
eventsRouter.post('/', (req, res) => {
  const parse = AutomationEventSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  const event: AutomationEvent = {
    ...parse.data,
    occurred_at: new Date().toISOString(),
  };

  logger.info('Automation event received', {
    event_type: event.event_type,
    tenant_id: event.tenant_id,
  });

  // TODO Phase 2: evaluate automation rules, trigger Teams / Email / Planner

  res.status(202).json({ data: { received: true, event_type: event.event_type }, error: null });
});
