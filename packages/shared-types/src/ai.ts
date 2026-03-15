export enum AiOperation {
  GenerateExecutiveSummary = 'generate_executive_summary',
  AnalyzeRisk = 'analyze_risk',
  GenerateRecommendations = 'generate_recommendations',
  AnalyzeCompliance = 'analyze_compliance',
}

export interface AiUsageLog {
  id: string;
  tenantId: string;
  userId: string;
  operation: AiOperation;
  tokensUsed: number;
  cost: number;
  responseTimeMs: number;
  createdAt: string;
}

export interface AiInsightRequest {
  tenantId: string;
  assessmentId: string;
  operation: AiOperation;
}

export interface AiInsightResponse {
  content: string;
  tokensUsed: number;
  responseTimeMs: number;
}
