export enum ComplianceFrameworkName {
  CisV8 = 'CIS Controls v8',
  Pipeda = 'PIPEDA',
  QuebecLaw25 = 'Quebec Law 25',
  MicrosoftZeroTrust = 'Microsoft Zero Trust',
  Fsi = 'FSI',
  Misa = 'MISA',
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
}

export interface ComplianceFramework {
  id: string;
  name: ComplianceFrameworkName;
  version: string;
  region: string;
  industry: string;
  controls: ComplianceControl[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceAssessment {
  id: string;
  tenantId: string;
  frameworkId: string;
  assessmentId: string;
  compliancePercentage: number;
  passedControls: number;
  totalControls: number;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
