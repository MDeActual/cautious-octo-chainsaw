export type SwarmName = 'devsecops-architecture' | 'continuous-compliance-audit';

export type RunState = 'running' | 'waiting_approval' | 'completed';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'waiting_approval';

export interface SwarmStage {
  name: string;
  status: StageStatus;
  hitlDecisionId?: string;
}

export interface ComplianceCoverage {
  law25: boolean;
  pipeda: boolean;
  itsg33: boolean;
  cisV8: boolean;
  nistCsf20: boolean;
  mitreAttack: boolean;
}

export interface SwarmRun {
  runId: string;
  swarmName: SwarmName;
  tenantId: string;
  operatorId: string;
  location: 'canadacentral' | 'canadaeast';
  state: RunState;
  createdAt: string;
  updatedAt: string;
  currentStage: string;
  stages: SwarmStage[];
  purviewAccountResourceId?: string;
  purviewCollectionId?: string;
  cisControlSetVersion: string;
  complianceCoverage: ComplianceCoverage;
  stateSavingTarget: string;
}

export interface CreateSwarmRunInput {
  swarmName: SwarmName;
  tenantId: string;
  operatorId: string;
  location: 'canadacentral' | 'canadaeast';
  purviewAccountResourceId?: string;
  purviewCollectionId?: string;
  cisControlSetVersion?: string;
  stateSavingTarget?: string;
}

export interface ApproveGateInput {
  decisionId: string;
  approvedBy: string;
  notes?: string;
}
