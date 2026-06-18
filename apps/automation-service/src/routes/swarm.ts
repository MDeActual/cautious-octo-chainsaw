import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { loadConfig } from '../config.js';
import {
  approveSwarmRunGate,
  createSwarmRun,
  getSwarmRun,
  progressSwarmRun,
} from '../services/swarm/orchestrator.js';

export const swarmRouter: ExpressRouter = Router();
const config = loadConfig();

const CreateSwarmRunSchema = z.object({
  swarmName: z.enum(['devsecops-architecture', 'continuous-compliance-audit']),
  tenantId: z.string().uuid(),
  operatorId: z.string().min(1),
  location: z.enum(['canadacentral', 'canadaeast']).optional(),
  purviewAccountResourceId: z.string().optional(),
  purviewCollectionId: z.string().optional(),
  cisControlSetVersion: z.string().optional(),
  stateSavingTarget: z.string().optional(),
});

const ApproveGateSchema = z.object({
  decisionId: z.enum([
    'InfrastructureDeployment',
    'MISA_Submission_Drafting',
    'Paid_API_Key_Activation',
  ]),
  approvedBy: z.string().min(1),
  notes: z.string().optional(),
});

swarmRouter.post('/runs', (req, res) => {
  const parsed = CreateSwarmRunSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.message });
    return;
  }

  try {
    const run = createSwarmRun({
      ...parsed.data,
      location: parsed.data.location ?? config.swarmDefaultLocation,
      stateSavingTarget: parsed.data.stateSavingTarget ?? config.swarmStateSavingTarget,
    });
    res.status(201).json({ data: run, error: null });
  } catch (error) {
    res.status(400).json({
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create swarm run',
    });
  }
});

swarmRouter.post('/runs/:runId/progress', (req, res) => {
  try {
    const run = progressSwarmRun(req.params.runId);
    res.json({ data: run, error: null });
  } catch (error) {
    res.status(400).json({
      data: null,
      error: error instanceof Error ? error.message : 'Failed to progress swarm run',
    });
  }
});

swarmRouter.post('/runs/:runId/approve', (req, res) => {
  const parsed = ApproveGateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ data: null, error: parsed.error.message });
    return;
  }

  try {
    const run = approveSwarmRunGate(req.params.runId, parsed.data);
    res.json({ data: run, error: null });
  } catch (error) {
    res.status(400).json({
      data: null,
      error: error instanceof Error ? error.message : 'Failed to approve gate',
    });
  }
});

swarmRouter.get('/runs/:runId', (req, res) => {
  const run = getSwarmRun(req.params.runId);
  if (!run) {
    res.status(404).json({ data: null, error: 'Run not found' });
    return;
  }

  res.json({ data: run, error: null });
});
