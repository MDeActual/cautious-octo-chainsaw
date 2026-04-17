import type {
  ApiResponse,
  SecurityAssessment,
  SecureScoreRecommendation,
  TrendResult
} from '@cloudmatrix/shared-types';

/**
 * API service layer for backend communication
 * All backend calls should go through this service
 */

const API_BASE_URL = import.meta.env['VITE_CORE_API'] ?? 'http://localhost:3003';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiResponse<T>;
      return {
        data: null,
        error: errorData.error ?? `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Assessment API
 */
export const assessmentApi = {
  /**
   * Get current assessment for a tenant
   */
  getCurrent: async (tenantId: string): Promise<ApiResponse<SecurityAssessment>> => {
    return apiFetch<SecurityAssessment>(`/assessments/${tenantId}/current`);
  },

  /**
   * Get assessment history for a tenant
   */
  getHistory: async (tenantId: string): Promise<ApiResponse<SecurityAssessment[]>> => {
    return apiFetch<SecurityAssessment[]>(`/assessments/${tenantId}/history`);
  },

  /**
   * Get trend analysis
   */
  getTrends: async (tenantId: string): Promise<ApiResponse<TrendResult>> => {
    return apiFetch<TrendResult>(`/assessments/${tenantId}/trends`);
  },

  /**
   * Trigger assessment refresh
   */
  refresh: async (tenantId: string): Promise<ApiResponse<SecurityAssessment>> => {
    return apiFetch<SecurityAssessment>(`/assessments/${tenantId}/refresh`, {
      method: 'POST',
    });
  },
};

/**
 * Mock API for development when backend is not available
 * This can be toggled via environment variable or feature flag
 */
export const mockAssessmentApi = {
  getCurrent: async (_tenantId: string): Promise<ApiResponse<SecurityAssessment>> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      data: {
        id: 'mock-assessment-001',
        tenant_id: 'mock-tenant',
        secure_score_raw: 152,
        secure_score_max: 250,
        security_percentage: 60.8,
        risk_level: 'Medium',
        opportunity_score: 39.2,
        lead_rank: 'Warm',
        assessed_at: new Date().toISOString(),
        user_count: 25,
        device_count: 30,
      },
      error: null,
    };
  },

  refresh: async (_tenantId: string): Promise<ApiResponse<SecurityAssessment>> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockAssessmentApi.getCurrent(_tenantId);
  },

  getTrends: async (_tenantId: string): Promise<ApiResponse<TrendResult>> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        direction: 'improving',
        percentage_change: 5.2,
        period_days: 30,
      },
      error: null,
    };
  },
};

/**
 * Mock recommendations for development
 */
export const mockRecommendations: SecureScoreRecommendation[] = [
  {
    id: 'rec-001',
    category: 'Identity',
    title: 'Enable MFA for all users',
    implementation_cost: 'Low',
    user_impact: 'Medium',
    threats: ['Account Compromise', 'Credential Theft'],
    score_in_percentage: 8.5,
    remediation_impact: 21,
  },
  {
    id: 'rec-002',
    category: 'Data',
    title: 'Enable Advanced Threat Protection',
    implementation_cost: 'Medium',
    user_impact: 'Low',
    threats: ['Malware', 'Phishing'],
    score_in_percentage: 6.2,
    remediation_impact: 15,
  },
  {
    id: 'rec-003',
    category: 'Device',
    title: 'Configure device compliance policies',
    implementation_cost: 'Medium',
    user_impact: 'High',
    threats: ['Unauthorized Access', 'Data Leakage'],
    score_in_percentage: 5.8,
    remediation_impact: 14,
  },
];
