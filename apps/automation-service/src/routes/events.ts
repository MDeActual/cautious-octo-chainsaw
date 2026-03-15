import { Router } from 'express';

export const eventsRouter: Router = Router();

// Internal endpoint for receiving events from other services
eventsRouter.post('/', (req, res) => {
  const { event, payload } = req.body as { event?: string; payload?: unknown };

  if (!event || !payload) {
    res.status(400).json({
      data: null,
      error: { code: 'BAD_REQUEST', message: 'event and payload are required' },
    });
    return;
  }

  // TODO: Implement event processing and rule matching
  res.status(202).json({ data: { message: 'Event received', event }, error: null });
});
