import { randomUUID } from 'crypto';
import { createLogger } from '@cloudmatrix/logger';
import type {
  ApproveGateInput,
  ComplianceCoverage,
  CreateSwarmRunInput,
  SwarmRun,
  SwarmStage,
} from './types.js';

const logger = createLogger({ service: 'automation-service' });

const runs = new Map<string, SwarmRun>();

function defaultComplianceCoverage(): ComplianceCoverage {
  return {
    law25: true,
    pipeda: true,
    itsg33: true,
    cisV8: true,
    nistCsf20: true,
    mitreAttack: true,
  };
}

function buildStages(swarmName: SwarmRun['swarmName']): SwarmStage[] {
  if (swarmName === 'devsecops-architecture') {
    return [
      { name: 'architecture-baseline', status: 'in_progress' },
      { name: 'infrastructure-deployment-gate', status: 'pending', hitlDecisionId: 'InfrastructureDeployment' },
      { name: 'kql-and-plugin-packaging', status: 'pending' },
      { name: 'misa-submission-gate', status: 'pending', hitlDecisionId: 'MISA_Submission_Drafting' },
      { name: 'run-complete', status: 'pending' },
    ];
  }

  return [
    { name: 'purview-sync-and-drift-baseline', status: 'in_progress' },
    { name: 'paid-api-activation-gate', status: 'pending', hitlDecisionId: 'Paid_API_Key_Activation' },
    { name: 'itsg33-and-law25-evidence-packaging', status: 'pending' },
    { name: 'run-complete', status: 'pending' },
  ];
}

function getStageIndex(run: SwarmRun, stageName: string): number {
  return run.stages.findIndex((stage) => stage.name === stageName);
}

function advanceRun(run: SwarmRun): SwarmRun {
  const currentIndex = getStageIndex(run, run.currentStage);
  if (currentIndex < 0) {
    throw new Error(`Current stage not found: ${run.currentStage}`);
  }

  const currentStage = run.stages[currentIndex];
  currentStage.status = 'completed';

  const nextStage = run.stages[currentIndex + 1];
  if (!nextStage) {
    run.state = 'completed';
    run.updatedAt = new Date().toISOString();
    return run;
  }

  if (nextStage.hitlDecisionId) {
    nextStage.status = 'waiting_approval';
    run.state = 'waiting_approval';
  } else {
    nextStage.status = 'in_progress';
    run.state = 'running';
  }

  run.currentStage = nextStage.name;
  run.updatedAt = new Date().toISOString();
  return run;
}

export function createSwarmRun(input: CreateSwarmRunInput): SwarmRun {
  if (input.swarmName === 'continuous-compliance-audit' && !input.purviewAccountResourceId) {
    throw new Error('purviewAccountResourceId is required for continuous-compliance-audit runs');
  }

  const runId = randomUUID();
  const now = new Date().toISOString();
  const stages = buildStages(input.swarmName);

  const run: SwarmRun = {
    runId,
    swarmName: input.swarmName,
    tenantId: input.tenantId,
    operatorId: input.operatorId,
    location: input.location,
    state: 'running',
    createdAt: now,
    updatedAt: now,
    currentStage: stages[0].name,
    stages,
    purviewAccountResourceId: input.purviewAccountResourceId,
    purviewCollectionId: input.purviewCollectionId,
    cisControlSetVersion: input.cisControlSetVersion ?? 'CIS Controls v8',
    complianceCoverage: defaultComplianceCoverage(),
    stateSavingTarget: input.stateSavingTarget ?? '/docs/state_capture.md',
  };

  runs.set(runId, run);
  logger.info('Swarm run created', {
    runId,
    swarmName: run.swarmName,
    tenantId: run.tenantId,
    location: run.location,
    purviewAccountResourceId: run.purviewAccountResourceId,
    cisControlSetVersion: run.cisControlSetVersion,
  });

  return run;
}

export function getSwarmRun(runId: string): SwarmRun | undefined {
  return runs.get(runId);
}

export function progressSwarmRun(runId: string): SwarmRun {
  const run = runs.get(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  if (run.state === 'waiting_approval') {
    throw new Error('Run is waiting for HITL approval and cannot progress');
  }

  return advanceRun(run);
}

export function approveSwarmRunGate(runId: string, input: ApproveGateInput): SwarmRun {
  const run = runs.get(runId);
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  if (run.state !== 'waiting_approval') {
    throw new Error('Run is not waiting for approval');
  }

  const stageIndex = getStageIndex(run, run.currentStage);
  const stage = run.stages[stageIndex];

  if (!stage.hitlDecisionId) {
    throw new Error('Current stage has no HITL decision gate');
  }

  if (stage.hitlDecisionId !== input.decisionId) {
    throw new Error(
      `Decision mismatch. Expected ${stage.hitlDecisionId}, received ${input.decisionId}`
    );
  }

  logger.info('Swarm gate approved', {
    runId,
    decisionId: input.decisionId,
    approvedBy: input.approvedBy,
    notes: input.notes,
  });

  return advanceRun(run);
}
